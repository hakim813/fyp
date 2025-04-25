import React, { useState } from 'react';
import { View, Button, Text, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const ScanReceipt = () => {
  const [ocrLines, setOcrLines] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        sendToOCRSpace(asset.base64);
      } else {
        Alert.alert('No Image Selected', 'Please select an image to proceed.');
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
      Alert.alert('Error', 'Failed to pick an image.');
    }
  };

  const sendToOCRSpace = async (base64Image) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('apikey', 'K86870090988957');
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);

      const response = await axios.post(
        'https://api.ocr.space/parse/image',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('OCR API Response:', response.data);

      const parsedText = response.data?.ParsedResults?.[0]?.ParsedText;
      if (parsedText) {
        const rawLines = parsedText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');
        
        const grouped = groupLines(rawLines);
        const transactions = parseTransactions(parsedText);
        console.log('Parsed Transactions:', transactions);
        setOcrLines(grouped);
      } else {
        Alert.alert('OCR Failed', 'No text found in the image.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert('Error', 'Failed to process the image.');
    } finally {
      setLoading(false);
    }
  };

  // Combine label + currency lines
  const groupLines = (lines) => {
    const grouped = [];
    const currencyRegex = /^-?MYR\s?\d+(\.\d{2})?$/;

    for (let i = 0; i < lines.length; i++) {
      if (i < lines.length - 1 && currencyRegex.test(lines[i + 1])) {
        grouped.push(`${lines[i]} ${lines[i + 1]}`);
        i++;
      } else {
        grouped.push(lines[i]);
      }
    }

    return grouped;
  };

  const parseTransactions = (text) => {
    const lines = text.split('\n');
    const data = {};
    let currentDate = null;
  
    const dateRegex = /\d{1,2} \w+ \d{4}/;     // Matches e.g., 21 Mar 2025
    const timeRegex = /\b\d{1,2}:\d{2}\b/;     // Matches e.g., 13:35
    const moneyRegex = /[+-]?\s?\d+\.\d{2}/g;  // Matches + 7.80, -21.00, etc.
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
  
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        currentDate = dateMatch[0];
        if (!data[currentDate]) data[currentDate] = {};
      }
  
      const timeMatch = line.match(timeRegex);
      if (timeMatch && currentDate) {
        const time = timeMatch[0];
        const nextLine = lines[i + 1] || '';
        const amounts = [...(line.match(moneyRegex) || []), ...(nextLine.match(moneyRegex) || [])];
  
        if (amounts.length) {
          if (!data[currentDate][time]) {
            data[currentDate][time] = amounts.length === 1 ? amounts[0].trim() : amounts.map(a => a.trim());
          }
        }
      }
    }
  
    return data;
  };
  

  return (
    <View style={{ flex: 1, padding: 100 }}>
      <Button title="Pick Image" onPress={pickImage} />
      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 20 }} />}
      {ocrLines.length > 0 && (
        <ScrollView style={{ marginTop: 20 }}>
          {ocrLines.map((line, index) => (
            <Text key={index} style={{ marginBottom: 5 }}>{line}</Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ScanReceipt;

