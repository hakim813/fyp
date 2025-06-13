import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const GOOGLE_PLACES_API_KEY = "AIzaSyA4CTWSmjIAeVPt6-D5p-pXley3v3so4RQ";

export default function PetrolStationsMap() {
  const [location, setLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchNearbyStations(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchNearbyStations = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: 3000,
            type: "gas_station",
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );
      setStations(response.data.results);
    } catch (error) {
      console.error("Error fetching petrol stations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNavigationOptions = async (lat, lng, name) => {
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;

    Alert.alert(
      `Navigate to ${name}`,
      "Choose your navigation app:",
      [
        {
          text: "Waze",
          onPress: async () => {
            const supported = await Linking.canOpenURL(wazeUrl);
            if (supported) {
              Linking.openURL(wazeUrl);
            } else {
              Alert.alert(
                "Waze is not installed. Opening Google Maps instead."
              );
              Linking.openURL(
                Platform.OS === "ios" ? appleMapsUrl : googleMapsUrl
              );
            }
          },
        },
        {
          text: Platform.OS === "ios" ? "Apple Maps" : "Google Maps",
          onPress: () =>
            Linking.openURL(
              Platform.OS === "ios" ? appleMapsUrl : googleMapsUrl
            ),
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
        <Text>Loading map and stations...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {/* User location marker */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="You are here"
        pinColor="blue"
      />

      {/* Petrol station markers */}
      {stations.map((station, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: station.geometry.location.lat,
            longitude: station.geometry.location.lng,
          }}
        >
          <Callout
            onPress={() =>
              openNavigationOptions(
                station.geometry.location.lat,
                station.geometry.location.lng,
                station.name
              )
            }
          >
            <View style={{ padding: 10, maxWidth: 200 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                {station.name}
              </Text>
              <Text style={{ marginBottom: 5 }}>{station.vicinity}</Text>
              <Text style={{ color: "blue" }}>Tap to navigate</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").height - 100,
    margin: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
