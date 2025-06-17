import { View, Text, StyleSheet } from 'react-native';
import { Hammer, Building } from 'lucide-react-native';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 60 }: LogoProps) {
  const iconSize = size * 0.6;
  const fontSize = size * 0.4;
  
  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Building size={iconSize} color="#fff" />
        <Hammer 
          size={iconSize * 0.6} 
          color="#fff" 
          style={{ position: 'absolute', bottom: size * 0.1, right: size * 0.1 }}
        />
      </View>
      <Text style={[styles.logoText, { fontSize }]}>BuildTrack</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#0B5394',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    color: '#0B5394',
  },
});