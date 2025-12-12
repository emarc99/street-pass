import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Target, Trophy, Clock, CheckCircle, Wifi, LogOut } from 'lucide-react-native';
import { supabase, Database } from '@/lib/supabase';
import { useWallet } from '@/contexts/WalletContext';
import { useUser } from '@/contexts/UserContext';

type Quest = Database['public']['Tables']['quests']['Row'];
type UserQuest = Database['public']['Tables']['user_quests']['Row'] & {
  quest: Quest;
};

export default function QuestsScreen() {
  const { isConnected, connect, disconnect, isConnecting, address } = useWallet();
  const { user } = useUser();
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadQuests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadQuests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_quests')
        .select('*, quest:quests(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading quests:', error);
        return;
      }

      setUserQuests(data as unknown as UserQuest[]);
    } catch (error) {
      console.error('Error in loadQuests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestProgress = (quest: UserQuest): number => {
    const requirements = quest.quest.requirements as { count?: number };
    const target = requirements.count || 1;
    return Math.min((quest.progress / target) * 100, 100);
  };

  const getQuestRequirementText = (quest: Quest): string => {
    const requirements = quest.requirements as any;

    switch (quest.quest_type) {
      case 'visit_count':
        return `Visit ${requirements.count} locations`;
      case 'visit_category':
        return `Visit ${requirements.count} ${requirements.category} locations`;
      case 'visit_specific':
        return `Visit specific locations`;
      default:
        return 'Complete the quest';
    }
  };

  const getTimeRemaining = (endDate: string): string => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  const claimReward = async (userQuest: UserQuest) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('user_quests')
        .update({ status: 'claimed' })
        .eq('id', userQuest.id);

      if (updateError) {
        console.error('Error claiming reward:', updateError);
        Alert.alert('Error', 'Failed to claim reward');
        return;
      }

      const { error: pointsError } = await supabase
        .from('users')
        .update({ total_points: user.total_points + userQuest.quest.reward_amount })
        .eq('id', user.id);

      if (pointsError) {
        console.error('Error updating points:', pointsError);
      }

      Alert.alert(
        'Reward Claimed!',
        `You earned ${userQuest.quest.reward_amount} points!`
      );

      loadQuests();
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward');
    }
  };

  if (!isConnected || !user) {
    return (
      <View style={styles.centerContainer}>
        <Target size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Connect Wallet</Text>
        <Text style={styles.emptyText}>
          Connect your wallet to view and complete quests
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={connect}
          disabled={isConnecting}
        >
          <Wifi size={16} color="#ffffff" />
          <Text style={styles.primaryButtonText}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Daily Quests</Text>
          <View style={styles.levelBadge}>
            <Trophy size={16} color="#fbbf24" />
            <Text style={styles.levelText}>Level {user.level}</Text>
          </View>
        </View>
        {isConnected && address && (
          <TouchableOpacity style={styles.addressBadge} onPress={disconnect}>
            <Text style={styles.addressText}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </Text>
            <LogOut size={14} color="#1e40af" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.total_points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {userQuests.filter((q) => q.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {userQuests.filter((q) => q.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {userQuests.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Quests Available</Text>
            <Text style={styles.emptyText}>
              Check back later for new quests
            </Text>
          </View>
        ) : (
          <View style={styles.questsList}>
            <Text style={styles.sectionTitle}>Your Quests</Text>
            {userQuests.map((userQuest) => (
              <View key={userQuest.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{userQuest.quest.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          userQuest.status === 'completed'
                            ? '#d1fae5'
                            : userQuest.status === 'active'
                            ? '#dbeafe'
                            : '#fee2e2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            userQuest.status === 'completed'
                              ? '#065f46'
                              : userQuest.status === 'active'
                              ? '#1e40af'
                              : '#991b1b',
                        },
                      ]}
                    >
                      {userQuest.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.questDescription}>
                  {userQuest.quest.description}
                </Text>

                <Text style={styles.requirementText}>
                  {getQuestRequirementText(userQuest.quest)}
                </Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${getQuestProgress(userQuest)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.floor(getQuestProgress(userQuest))}%
                  </Text>
                </View>

                <View style={styles.questFooter}>
                  <View style={styles.rewardContainer}>
                    <Trophy size={16} color="#fbbf24" />
                    <Text style={styles.rewardText}>
                      {userQuest.quest.reward_amount} points
                    </Text>
                  </View>

                  <View style={styles.timeContainer}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={styles.timeText}>
                      {getTimeRemaining(userQuest.quest.active_until)}
                    </Text>
                  </View>
                </View>

                {userQuest.status === 'completed' && (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => claimReward(userQuest)}
                  >
                    <CheckCircle size={18} color="#ffffff" />
                    <Text style={styles.claimButtonText}>Claim Reward</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addressText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  questsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  questCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  questDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  requirementText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
