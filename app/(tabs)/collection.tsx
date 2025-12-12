import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Grid, MapPin, Calendar, Award, Wifi, LogOut } from 'lucide-react-native';
import { supabase, Database } from '@/lib/supabase';
import { useWallet } from '@/contexts/WalletContext';
import { useUser } from '@/contexts/UserContext';

type CheckIn = Database['public']['Tables']['check_ins']['Row'] & {
  location: Database['public']['Tables']['locations']['Row'];
};

export default function CollectionScreen() {
  const { isConnected, connect, disconnect, isConnecting, address } = useWallet();
  const { user } = useUser();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');

  useEffect(() => {
    if (user) {
      loadCollection();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCollection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*, location:locations(*)')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error loading collection:', error);
        return;
      }

      setCheckIns(data as unknown as CheckIn[]);
    } catch (error) {
      console.error('Error in loadCollection:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityTier = (score: number | null): string => {
    if (!score) return 'Common';
    if (score >= 75) return 'Legendary';
    if (score >= 50) return 'Epic';
    if (score >= 25) return 'Rare';
    return 'Common';
  };

  const getRarityColor = (score: number | null): string => {
    if (!score) return '#9ca3af';
    if (score >= 75) return '#fbbf24';
    if (score >= 50) return '#a78bfa';
    if (score >= 25) return '#3b82f6';
    return '#9ca3af';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  const getFilteredCheckIns = () => {
    if (filter === 'all') return checkIns;

    return checkIns.filter((checkIn) => {
      const rarity = getRarityTier(checkIn.rarity_score).toLowerCase();
      return rarity === filter;
    });
  };

  const getRarityCount = (rarityFilter: string): number => {
    if (rarityFilter === 'all') return checkIns.length;

    return checkIns.filter((checkIn) => {
      const rarity = getRarityTier(checkIn.rarity_score).toLowerCase();
      return rarity === rarityFilter;
    }).length;
  };

  if (!isConnected || !user) {
    return (
      <View style={styles.centerContainer}>
        <Grid size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Connect Wallet</Text>
        <Text style={styles.emptyText}>
          Connect your wallet to view your NFT collection
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
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }

  const filteredCheckIns = getFilteredCheckIns();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Collection</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{checkIns.length} NFTs</Text>
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

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Award size={20} color="#3b82f6" />
          <Text style={styles.statNumber}>{checkIns.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color="#fbbf24" />
          <Text style={styles.statNumber}>{getRarityCount('legendary')}</Text>
          <Text style={styles.statLabel}>Legendary</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color="#a78bfa" />
          <Text style={styles.statNumber}>{getRarityCount('epic')}</Text>
          <Text style={styles.statLabel}>Epic</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color="#3b82f6" />
          <Text style={styles.statNumber}>{getRarityCount('rare')}</Text>
          <Text style={styles.statLabel}>Rare</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        style={styles.filterScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {(['all', 'legendary', 'epic', 'rare', 'common'] as const).map((rarityFilter) => (
          <TouchableOpacity
            key={rarityFilter}
            style={[
              styles.filterButton,
              filter === rarityFilter && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(rarityFilter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === rarityFilter && styles.filterButtonTextActive,
              ]}
            >
              {rarityFilter.charAt(0).toUpperCase() + rarityFilter.slice(1)}
            </Text>
            <Text
              style={[
                styles.filterCount,
                filter === rarityFilter && styles.filterCountActive,
              ]}
            >
              {getRarityCount(rarityFilter)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredCheckIns.length === 0 ? (
          <View style={styles.emptyState}>
            <Grid size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No NFTs Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Start checking in to locations to collect NFTs'
                : `You don't have any ${filter} NFTs yet`}
            </Text>
          </View>
        ) : (
          <View style={styles.nftGrid}>
            {filteredCheckIns.map((checkIn) => (
              <View key={checkIn.id} style={styles.nftCard}>
                <View
                  style={[
                    styles.nftImagePlaceholder,
                    { backgroundColor: getRarityColor(checkIn.rarity_score) + '20' },
                  ]}
                >
                  <MapPin size={32} color={getRarityColor(checkIn.rarity_score)} />
                </View>

                <View style={styles.nftContent}>
                  <View
                    style={[
                      styles.rarityBadge,
                      { backgroundColor: getRarityColor(checkIn.rarity_score) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rarityText,
                        { color: getRarityColor(checkIn.rarity_score) },
                      ]}
                    >
                      {getRarityTier(checkIn.rarity_score)}
                    </Text>
                  </View>

                  <Text style={styles.nftName} numberOfLines={2}>
                    {checkIn.location.name}
                  </Text>

                  <Text style={styles.nftCategory}>
                    {checkIn.location.category}
                  </Text>

                  <View style={styles.nftFooter}>
                    <Calendar size={12} color="#9ca3af" />
                    <Text style={styles.nftDate}>
                      {formatDate(checkIn.timestamp)}
                    </Text>
                  </View>

                  {checkIn.rarity_score && (
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreLabel}>Rarity Score</Text>
                      <Text
                        style={[
                          styles.scoreValue,
                          { color: getRarityColor(checkIn.rarity_score) },
                        ]}
                      >
                        {checkIn.rarity_score}
                      </Text>
                    </View>
                  )}
                </View>
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
  countBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '700',
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
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  filterCountActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  nftCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  nftImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nftContent: {
    padding: 12,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  nftName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    minHeight: 36,
  },
  nftCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  nftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  nftDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 16,
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
    paddingHorizontal: 24,
  },
});
