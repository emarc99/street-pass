import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { MapPin, Navigation, Wifi } from 'lucide-react-native';
import { supabase, Database } from '@/lib/supabase';
import { useWallet } from '@/contexts/WalletContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';

type LocationData = Database['public']['Tables']['locations']['Row'];

interface LocationWithDistance extends LocationData {
  distance: number;
}

export default function MapScreen() {
  const { isConnected, connect, isConnecting, address } = useWallet();
  const { user } = useUser();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locations, setLocations] = useState<LocationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbyLocations();
    }
  }, [userLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation(location);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const loadNearbyLocations = async () => {
    if (!userLocation) return;

    try {
      const { data, error } = await supabase.from('locations').select('*');

      if (error) {
        console.error('Error loading locations:', error);
        setLoading(false);
        return;
      }

      const locationsWithDistance = data.map((loc) => ({
        ...loc,
        distance: calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          Number(loc.latitude),
          Number(loc.longitude)
        ),
      }));

      locationsWithDistance.sort((a, b) => a.distance - b.distance);
      setLocations(locationsWithDistance);
    } catch (error) {
      console.error('Error in loadNearbyLocations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (location: LocationWithDistance) => {
    if (!isConnected) {
      Alert.alert('Connect Wallet', 'Please connect your wallet to check in');
      return;
    }

    if (location.distance > 0.1) {
      Alert.alert(
        'Too Far Away',
        `You need to be within 100 meters of this location to check in. You are ${(location.distance * 1000).toFixed(0)} meters away.`
      );
      return;
    }

    Alert.alert(
      'Check In',
      `Check in at ${location.name}? This will mint a location NFT!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: () => performCheckIn(location),
        },
      ]
    );
  };

  const performCheckIn = async (location: LocationWithDistance) => {
    if (!user) return;

    try {
      const rarityScore = calculateRarity(location);

      const { data, error } = await supabase
        .from('check_ins')
        .insert([
          {
            user_id: user.id,
            location_id: location.id,
            rarity_score: rarityScore,
            nft_token_id: `temp-${Date.now()}`,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error checking in:', error);
        Alert.alert('Error', 'Failed to check in. Please try again.');
        return;
      }

      const points = rarityScore * 10;
      await supabase
        .from('users')
        .update({ total_points: user.total_points + points })
        .eq('id', user.id);

      Alert.alert(
        'Success!',
        `Checked in at ${location.name}!\n\nRarity: ${getRarityTier(rarityScore)}\nPoints earned: ${points}`
      );

      loadNearbyLocations();
    } catch (error) {
      console.error('Error in performCheckIn:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
    }
  };

  const calculateRarity = (location: LocationWithDistance): number => {
    const hour = new Date().getHours();
    const isNightTime = hour >= 20 || hour < 6;
    const nightBonus = isNightTime ? 1.5 : 1.0;

    const baseRarity = location.base_rarity || 1;
    const rarityScore = Math.floor(baseRarity * 25 * nightBonus);

    return Math.min(rarityScore, 100);
  };

  const getRarityTier = (score: number): string => {
    if (score >= 75) return 'Legendary';
    if (score >= 50) return 'Epic';
    if (score >= 25) return 'Rare';
    return 'Common';
  };

  const getRarityColor = (score: number): string => {
    if (score >= 75) return '#fbbf24';
    if (score >= 50) return '#a78bfa';
    if (score >= 25) return '#3b82f6';
    return '#9ca3af';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.centerContainer}>
        <MapPin size={64} color="#9ca3af" />
        <Text style={styles.permissionTitle}>Location Permission Required</Text>
        <Text style={styles.permissionText}>
          StreetPass needs access to your location to discover nearby locations and enable check-ins.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestLocationPermission}>
          <Text style={styles.primaryButtonText}>Enable Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Locations</Text>
        {!isConnected && (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={connect}
            disabled={isConnecting}
          >
            <Wifi size={16} color="#ffffff" />
            <Text style={styles.connectButtonText}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Text>
          </TouchableOpacity>
        )}
        {isConnected && address && (
          <View style={styles.addressBadge}>
            <Text style={styles.addressText}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {locations.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Locations Found</Text>
            <Text style={styles.emptyText}>Try moving to a different area</Text>
          </View>
        ) : (
          locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.locationCard}
              onPress={() => handleCheckIn(location)}
            >
              <View style={styles.locationHeader}>
                <View style={styles.locationTitleRow}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <View
                    style={[
                      styles.rarityBadge,
                      { backgroundColor: getRarityColor(location.base_rarity * 25) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rarityText,
                        { color: getRarityColor(location.base_rarity * 25) },
                      ]}
                    >
                      {getRarityTier(location.base_rarity * 25)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.locationCategory}>{location.category}</Text>
              </View>

              {location.description && (
                <Text style={styles.locationDescription} numberOfLines={2}>
                  {location.description}
                </Text>
              )}

              <View style={styles.locationFooter}>
                <View style={styles.distanceContainer}>
                  <Navigation size={14} color="#6b7280" />
                  <Text style={styles.distanceText}>
                    {location.distance < 1
                      ? `${(location.distance * 1000).toFixed(0)} m`
                      : `${location.distance.toFixed(2)} km`}
                  </Text>
                </View>

                {location.distance <= 0.1 ? (
                  <View style={styles.checkInBadge}>
                    <Text style={styles.checkInBadgeText}>In Range</Text>
                  </View>
                ) : (
                  <Text style={styles.outOfRangeText}>Out of Range</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  addressBadge: {
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
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  locationHeader: {
    marginBottom: 8,
  },
  locationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  locationCategory: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  locationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkInBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  checkInBadgeText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '600',
  },
  outOfRangeText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
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
  },
});
