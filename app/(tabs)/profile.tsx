import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  User,
  Wallet,
  Trophy,
  MapPin,
  Target,
  LogOut,
  Edit3,
  CheckCircle,
  X,
} from 'lucide-react-native';
import { useWallet } from '@/contexts/WalletContext';
import { useUser } from '@/contexts/UserContext';

export default function ProfileScreen() {
  const { address, balance, isConnected, connect, disconnect, isConnecting } = useWallet();
  const { user, updateUsername } = useUser();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    const success = await updateUsername(newUsername.trim());

    if (success) {
      Alert.alert('Success', 'Username updated successfully');
      setIsEditingUsername(false);
      setNewUsername('');
    } else {
      Alert.alert('Error', 'Failed to update username. It may already be taken.');
    }
  };

  if (!isConnected) {
    return (
      <View style={styles.centerContainer}>
        <Wallet size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Connect Your Wallet</Text>
        <Text style={styles.emptyText}>
          Connect your wallet to view your profile and start collecting location NFTs
        </Text>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={connect}
          disabled={isConnecting}
        >
          <Text style={styles.connectButtonText}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={disconnect}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color="#3b82f6" />
            </View>
          </View>

          <View style={styles.usernameContainer}>
            {isEditingUsername ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.usernameInput}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="Enter username"
                  autoFocus
                  autoCapitalize="none"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.editActionButton}
                    onPress={handleUpdateUsername}
                  >
                    <CheckCircle size={20} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editActionButton}
                    onPress={() => {
                      setIsEditingUsername(false);
                      setNewUsername('');
                    }}
                  >
                    <X size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.usernameRow}>
                <Text style={styles.username}>
                  {user.username || 'Anonymous Explorer'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setNewUsername(user.username || '');
                    setIsEditingUsername(true);
                  }}
                >
                  <Edit3 size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.levelBadge}>
            <Trophy size={20} color="#fbbf24" />
            <Text style={styles.levelText}>Level {user.level}</Text>
          </View>

          <View style={styles.walletInfo}>
            <Wallet size={16} color="#6b7280" />
            <Text style={styles.walletAddress}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Text>
          </View>

          {balance && (
            <Text style={styles.balanceText}>{Number(balance).toFixed(4)} ETH</Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Trophy size={24} color="#fbbf24" />
            </View>
            <Text style={styles.statValue}>{user.total_points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{user.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About StreetPass</Text>
          <Text style={styles.infoText}>
            StreetPass is a location-based gaming experience where you collect unique NFTs by
            visiting real-world locations. Complete quests, explore your city, and collect rare
            digital collectibles!
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>How Rarity Works</Text>
          <View style={styles.rarityList}>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: '#9ca3af' }]} />
              <View style={styles.rarityInfo}>
                <Text style={styles.rarityName}>Common (1-24%)</Text>
                <Text style={styles.rarityDescription}>Easy to find anytime</Text>
              </View>
            </View>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: '#3b82f6' }]} />
              <View style={styles.rarityInfo}>
                <Text style={styles.rarityName}>Rare (25-49%)</Text>
                <Text style={styles.rarityDescription}>Less common locations</Text>
              </View>
            </View>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: '#a78bfa' }]} />
              <View style={styles.rarityInfo}>
                <Text style={styles.rarityName}>Epic (50-74%)</Text>
                <Text style={styles.rarityDescription}>Special locations or nighttime</Text>
              </View>
            </View>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: '#fbbf24' }]} />
              <View style={styles.rarityInfo}>
                <Text style={styles.rarityName}>Legendary (75-100%)</Text>
                <Text style={styles.rarityDescription}>Rare locations at night</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Network Information</Text>
          <View style={styles.networkInfo}>
            <Text style={styles.networkLabel}>Chain:</Text>
            <Text style={styles.networkValue}>Scroll Mainnet</Text>
          </View>
          <View style={styles.networkInfo}>
            <Text style={styles.networkLabel}>Chain ID:</Text>
            <Text style={styles.networkValue}>534352</Text>
          </View>
        </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameContainer: {
    width: '100%',
    marginBottom: 12,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  editContainer: {
    width: '100%',
  },
  usernameInput: {
    width: '100%',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  editActionButton: {
    padding: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  levelText: {
    color: '#92400e',
    fontSize: 16,
    fontWeight: '700',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  balanceText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  rarityList: {
    gap: 12,
  },
  rarityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rarityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rarityInfo: {
    flex: 1,
  },
  rarityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  rarityDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  networkInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  networkLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  networkValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
});
