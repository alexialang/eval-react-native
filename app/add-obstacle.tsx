import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export interface Obstacle {
  id: string;
  description: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

export default function AddObstacleScreen() {
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Permission de géolocalisation requise pour obtenir la position actuelle.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      
      Alert.alert('Succès', 'Position actuelle récupérée avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la position actuelle.');
    } finally {
      setLoading(false);
    }
  };

  const validateCoordinates = () => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return false;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return false;
      }
    }
    return true;
  };

  const saveObstacle = async () => {
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une description de l\'obstacle.');
      return;
    }

    if (!validateCoordinates()) {
      Alert.alert(
        'Erreur',
        'Coordonnées invalides. Latitude: -90 à 90, Longitude: -180 à 180'
      );
      return;
    }

    try {
      const existingObstacles = await AsyncStorage.getItem('obstacles');
      const obstacles: Obstacle[] = existingObstacles ? JSON.parse(existingObstacles) : [];

      const newObstacle: Obstacle = {
        id: Date.now().toString(),
        description: description.trim(),
        timestamp: new Date().toISOString(),
      };

      if (latitude && longitude) {
        newObstacle.latitude = parseFloat(latitude);
        newObstacle.longitude = parseFloat(longitude);
      }

      obstacles.push(newObstacle);
      await AsyncStorage.setItem('obstacles', JSON.stringify(obstacles));

      // Fermer le modal et retourner à l'écran principal
      router.back();
      
      // Afficher le message de succès après la fermeture
      setTimeout(() => {
        Alert.alert('Succès', 'Obstacle ajouté avec succès !');
      }, 100);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'obstacle.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerEmoji}>🚧</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Nouvel Obstacle
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            🎯 Ajoutons un obstacle comme un boss !
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedText type="subtitle" style={styles.label}>
            📝 Description de l'obstacle *
          </ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="🚦 Ex: Feu tricolore à démonter, route barrée..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />

          <ThemedText type="subtitle" style={styles.label}>
            📍 Coordonnées GPS (optionnel)
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.gpsButton} 
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <ThemedText style={styles.gpsEmoji}>🎯</ThemedText>
            <ThemedText style={styles.gpsButtonText}>
              {loading ? 'Récupération...' : 'Utiliser position actuelle'}
            </ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.coordinatesContainer}>
            <ThemedView style={styles.coordinateInput}>
              <ThemedText style={styles.coordinateLabel}>Latitude</ThemedText>
              <TextInput
                style={styles.coordinateTextInput}
                placeholder="46.2044"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.coordinateInput}>
              <ThemedText style={styles.coordinateLabel}>Longitude</ThemedText>
              <TextInput
                style={styles.coordinateTextInput}
                placeholder="6.1432"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </ThemedView>
          </ThemedView>

          <TouchableOpacity style={styles.saveButton} onPress={saveObstacle}>
            <ThemedText style={styles.saveEmoji}>💾</ThemedText>
            <ThemedText style={styles.saveButtonText}>
              Sauvegarder l'obstacle
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE066',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  title: {
    marginTop: 0,
    marginBottom: 15,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    marginBottom: 10,
    color: '#4A5568',
    fontSize: 17,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFBFC',
    textAlignVertical: 'top',
    marginBottom: 24,
    color: '#4A5568',
    minHeight: 100,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: '#26D0CE',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  gpsButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  coordinateInput: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'transparent',
  },
  coordinateLabel: {
    fontSize: 15,
    color: '#8492A6',
    marginBottom: 8,
    fontWeight: '500',
  },
  coordinateTextInput: {
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FAFBFC',
    color: '#4A5568',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    padding: 20,
    marginBottom: 16,
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
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 0,
  },
  gpsEmoji: {
    fontSize: 20,
  },
  saveEmoji: {
    fontSize: 20,
  },
});
