import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export interface Obstacle {
  id: string;
  description: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

export default function ObstaclesScreen() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadObstacles = async () => {
    try {
      const stored = await AsyncStorage.getItem('obstacles');
      if (stored) {
        const parsed = JSON.parse(stored);
        setObstacles(parsed.sort((a: Obstacle, b: Obstacle) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des obstacles:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadObstacles();
    setRefreshing(false);
  };

  const deleteObstacle = async (obstacleId: string) => {
    console.log('deleteObstacle appelée avec ID:', obstacleId);
    console.log('Obstacles actuels:', obstacles.length);
    
    try {
      console.log('Début de la suppression pour ID:', obstacleId);
      const newObstacles = obstacles.filter(obs => obs.id !== obstacleId);
      console.log('Nouveaux obstacles après filtrage:', newObstacles.length);
      
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('obstacles', JSON.stringify(newObstacles));
      console.log('Sauvegarde AsyncStorage réussie');
      
      // Mettre à jour l'état
      setObstacles(newObstacles);
      console.log('État mis à jour');
      
      Alert.alert('Succès', 'Obstacle supprimé !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'obstacle.');
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCoordinates = (lat?: number, lng?: number) => {
    if (!lat || !lng) return null;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  useFocusEffect(
    useCallback(() => {
      loadObstacles();
    }, [])
  );

  const renderObstacle = ({ item }: { item: Obstacle }) => (
    <ThemedView style={styles.obstacleCard}>
      <ThemedView style={styles.obstacleHeader}>
        <ThemedText style={styles.obstacleEmoji}>🚧</ThemedText>
        <ThemedText style={styles.obstacleDate}>
          {formatDate(item.timestamp)}
        </ThemedText>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            console.log('Bouton suppression cliqué pour:', item.id);
            deleteObstacle(item.id);
          }}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedText style={styles.obstacleDescription}>
        {item.description}
      </ThemedText>
      
      {item.latitude && item.longitude && (
        <ThemedView style={styles.coordinatesContainer}>
          <ThemedText style={styles.locationEmoji}>📍</ThemedText>
          <ThemedText style={styles.coordinates}>
            {formatCoordinates(item.latitude, item.longitude)}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyEmoji}>🤔</ThemedText>
      <ThemedText style={styles.emptyTitle}>🎉 Aucun obstacle ! 🎉</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        🚀 C'est parti ! Ajoutez votre premier obstacle pour commencer l'aventure !
      </ThemedText>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE066', dark: '#1C1C1E' }}
      headerImage={
        <ThemedText style={styles.headerEmoji}>🚛</ThemedText>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Obstacles du Parcours</ThemedText>
      </ThemedView>

      <ThemedText style={styles.description}>
        Gérer vos obstacles
      </ThemedText>

      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{obstacles.length}</ThemedText>
          <ThemedText style={styles.statLabel}>🚨 Obstacles</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{obstacles.filter(o => o.latitude && o.longitude).length}</ThemedText>
          <ThemedText style={styles.statLabel}>📍 Avec GPS</ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-obstacle')}
      >
        <IconSymbol name="plus.circle.fill" size={24} color="white" />
        <ThemedText style={styles.addButtonText}>
          ✨ Ajouter un obstacle
        </ThemedText>
      </TouchableOpacity>

      {obstacles.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={obstacles}
          renderItem={renderObstacle}
          keyExtractor={(item) => item.id}
          style={styles.obstaclesList}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    opacity: 0.8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  obstaclesList: {
    marginTop: 10,
  },
  obstacleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE066',
    shadowColor: '#FFE066',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  obstacleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  obstacleDate: {
    flex: 1,
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4757',
    shadowColor: '#FF4757',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  obstacleDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A8E6CF',
    borderRadius: 20,
    padding: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#2ECC71',
  },
  coordinates: {
    fontSize: 13,
    color: '#27AE60',
    marginLeft: 6,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'transparent',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  obstacleEmoji: {
    fontSize: 24,
  },
  locationEmoji: {
    fontSize: 16,
  },
  emptyEmoji: {
    fontSize: 80,
  },
  headerEmoji: {
    fontSize: 120,
    position: 'absolute',
    bottom: 60,
    left: 20,
  },
  deleteButtonText: {
    color: '#FF4757',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});