import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Trophy, Clock, CheckCircle, Wifi, LogOut, Sparkles, Flame, Zap, Star } from 'lucide-react-native';
import { supabase, Database } from '@/lib/supabase';
import { useWallet } from '@/contexts/WalletContext';
import { useUser } from '@/contexts/UserContext';

const { width } = Dimensions.get('window');

type Quest = Database['public']['Tables']['quests']['Row'];
type UserQuest = Database['public']['Tables']['user_quests']['Row'] & {
  quest: Quest;
};

export default function QuestsScreen() {
  const { isConnected, connect, disconnect, isConnecting, address } = useWallet();
  const { user, loading: userLoading } = useUser();
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
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.centerContainer}
      >
        <View style={styles.glowContainer}>
          <View style={styles.iconGlow}>
            <Target size={72} color="#60a5fa" strokeWidth={2.5} />
          </View>
        </View>
        <Text style={styles.emptyTitleWhite}>Begin Your Journey</Text>
        <Text style={styles.emptyTextWhite}>
          Connect your wallet to unlock epic quests and earn rewards
        </Text>
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={connect}
          disabled={isConnecting}
        >
          <LinearGradient
            colors={['#3b82f6', '#2563eb', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButtonInner}
          >
            <Sparkles size={20} color="#ffffff" />
            <Text style={styles.gradientButtonText}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (loading || userLoading) {
    return (
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>
          {userLoading ? 'Loading profile...' : 'Loading quests...'}
        </Text>
      </LinearGradient>
    );
  }

  const getQuestIcon = (questType: string) => {
    switch (questType) {
      case 'visit_count':
        return <Target size={24} color="#60a5fa" strokeWidth={2.5} />;
      case 'visit_category':
        return <Sparkles size={24} color="#a78bfa" strokeWidth={2.5} />;
      case 'visit_specific':
        return <Star size={24} color="#fbbf24" strokeWidth={2.5} />;
      default:
        return <Zap size={24} color="#10b981" strokeWidth={2.5} />;
    }
  };

  const getDifficultyColor = (rewardAmount: number): [string, string, string] => {
    if (rewardAmount >= 100) return ['#dc2626', '#b91c1c', '#991b1b'];
    if (rewardAmount >= 50) return ['#f59e0b', '#d97706', '#b45309'];
    return ['#10b981', '#059669', '#047857'];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Epic Quests</Text>
            <LinearGradient
              colors={['#fbbf24', '#f59e0b', '#d97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.levelBadge}
            >
              <Trophy size={16} color="#ffffff" />
              <Text style={styles.levelText}>Level {user.level}</Text>
            </LinearGradient>
          </View>
          {isConnected && address && (
            <TouchableOpacity style={styles.addressBadge} onPress={disconnect}>
              <Text style={styles.addressText}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </Text>
              <LogOut size={14} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          style={styles.statsContainer}
        >
          <View style={styles.statBox}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.statGradient}
            >
              <Sparkles size={20} color="#ffffff" />
              <Text style={styles.statValue}>{user.total_points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </LinearGradient>
          </View>
          <View style={styles.statBox}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.statGradient}
            >
              <CheckCircle size={20} color="#ffffff" />
              <Text style={styles.statValue}>
                {userQuests.filter((q) => q.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </LinearGradient>
          </View>
          <View style={styles.statBox}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.statGradient}
            >
              <Flame size={20} color="#ffffff" />
              <Text style={styles.statValue}>
                {userQuests.filter((q) => q.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </LinearGradient>
          </View>
        </LinearGradient>

        {userQuests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Target size={64} color="#475569" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Active Quests</Text>
            <Text style={styles.emptyText}>
              New adventures await! Check back soon for exciting challenges
            </Text>
          </View>
        ) : (
          <View style={styles.questsList}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Quests</Text>
              <View style={styles.questCount}>
                <Text style={styles.questCountText}>{userQuests.length}</Text>
              </View>
            </View>
            {userQuests.map((userQuest) => {
              const progress = getQuestProgress(userQuest);
              const isCompleted = userQuest.status === 'completed';
              const isClaimed = userQuest.status === 'claimed';

              return (
                <View key={userQuest.id} style={styles.questCard}>
                  <LinearGradient
                    colors={
                      isCompleted || isClaimed
                        ? ['#064e3b', '#065f46', '#047857']
                        : ['#1e293b', '#334155', '#475569']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.questCardGradient}
                  >
                    <View style={styles.questIconContainer}>
                      {getQuestIcon(userQuest.quest.quest_type)}
                    </View>

                    <View style={styles.questContent}>
                      <View style={styles.questHeader}>
                        <Text style={styles.questTitle}>{userQuest.quest.title}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                isCompleted || isClaimed ? '#10b98133' : '#3b82f633',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: isCompleted || isClaimed ? '#10b981' : '#60a5fa',
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

                      <View style={styles.requirementContainer}>
                        <View style={styles.requirementDot} />
                        <Text style={styles.requirementText}>
                          {getQuestRequirementText(userQuest.quest)}
                        </Text>
                      </View>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <LinearGradient
                            colors={['#3b82f6', '#2563eb', '#1d4ed8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.progressFill,
                              { width: `${progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {Math.floor(progress)}%
                        </Text>
                      </View>

                      <View style={styles.questFooter}>
                        <LinearGradient
                          colors={getDifficultyColor(userQuest.quest.reward_amount)}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.rewardBadge}
                        >
                          <Trophy size={14} color="#ffffff" />
                          <Text style={styles.rewardBadgeText}>
                            +{userQuest.quest.reward_amount}
                          </Text>
                        </LinearGradient>

                        <View style={styles.timeContainer}>
                          <Clock size={14} color="#94a3b8" />
                          <Text style={styles.timeText}>
                            {getTimeRemaining(userQuest.quest.active_until)}
                          </Text>
                        </View>
                      </View>

                      {isCompleted && userQuest.status !== 'claimed' && (
                        <TouchableOpacity
                          style={styles.claimButtonWrapper}
                          onPress={() => claimReward(userQuest)}
                        >
                          <LinearGradient
                            colors={['#10b981', '#059669', '#047857']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.claimButton}
                          >
                            <Sparkles size={18} color="#ffffff" />
                            <Text style={styles.claimButtonText}>Claim Reward</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  </LinearGradient>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  glowContainer: {
    marginBottom: 32,
  },
  iconGlow: {
    padding: 24,
    borderRadius: 100,
    backgroundColor: '#1e293b',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyTitleWhite: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyTextWhite: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  gradientButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  gradientButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  addressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addressText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94a3b8',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
  },
  statGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: '#ffffffcc',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questsList: {
    padding: 20,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  questCount: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questCountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  questCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  questCardGradient: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  questIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff15',
  },
  questContent: {
    flex: 1,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  questTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    lineHeight: 26,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 12,
    lineHeight: 20,
  },
  requirementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60a5fa',
  },
  requirementText: {
    fontSize: 13,
    color: '#60a5fa',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#0f172a',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    minWidth: 40,
    textAlign: 'right',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rewardBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  claimButtonWrapper: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    padding: 20,
    borderRadius: 100,
    backgroundColor: '#1e293b',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
