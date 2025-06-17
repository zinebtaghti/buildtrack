import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface VoiceNoteProps {
  onRecordingComplete: (uri: string) => void;
  onDelete?: () => void;
  existingAudioUrl?: string;
  onUploadStart?: () => void;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  tags?: string[];
}

export function VoiceNote({ 
  onRecordingComplete, 
  onDelete, 
  existingAudioUrl,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  folder = 'project_voice_notes',
  tags = []
}: VoiceNoteProps) {
  const { uploadAudio, loading: uploading } = useMediaUpload();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    Audio.requestPermissionsAsync().then(({ granted }) => {
      if (!granted) {
        Alert.alert('Permission Required', 'Please grant microphone permission to record voice notes.');
      }
    });

    if (existingAudioUrl) {
      loadExistingAudio();
    }

    return () => {
      if (sound) sound.unloadAsync();
      if (recording) recording.stopAndUnloadAsync();
    };
  }, [existingAudioUrl]);

  const loadExistingAudio = async () => {
    try {
      if (!existingAudioUrl) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: existingAudioUrl },
        { shouldPlay: false }
      );
      setSound(newSound);
      
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Error', 'Failed to load voice note');
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('Failed to get recording URI');
      
      setIsRecording(false);
      
      if (onUploadStart) onUploadStart();
      
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);
      const result = await uploadAudio(uri, {
        folder,
        resourceType: 'video',
        public_id: `voice_note_${timestamp}_${randomString}`,
        tags
      });
      
      if (onUploadComplete) onUploadComplete(result.url);
      onRecordingComplete(result.url);
    } catch (error: any) {
      console.error('Voice note error:', error);
      if (onUploadError) onUploadError(error.message);
    } finally {
      setRecording(null);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.replayAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play voice note');
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!sound ? (
        <TouchableOpacity
          style={[styles.button, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={uploading}
        >
          {isRecording ? (
            <>
              <Square size={20} color="#fff" />
              <Text style={styles.buttonText}>Stop Recording</Text>
            </>
          ) : (
            <>
              <Mic size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {uploading ? 'Uploading...' : 'Record Voice Note'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.playbackContainer}>
          <TouchableOpacity
            style={[styles.button, styles.playButton]}
            onPress={togglePlayback}
          >
            {isPlaying ? (
              <>
                <Pause size={20} color="#fff" />
                <Text style={styles.buttonText}>Pause</Text>
              </>
            ) : (
              <>
                <Play size={20} color="#fff" />
                <Text style={styles.buttonText}>Play</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.duration}>{formatDuration(duration)}</Text>

          {onDelete && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onDelete}
            >
              <Trash2 size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B5394',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recordingButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    paddingHorizontal: 12,
  },
  deleteButton: {
    backgroundColor: '#E53935',
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  duration: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 12,
  },
});
