import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { uploadDocumentToCloudinary } from '@/services/cloudinaryService';
import {
  getNotificationLoadError,
  scheduleQuickDropReminder,
} from '@/services/notificationService';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';

const looksLikeUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim());
const pad = (value: number) => String(value).padStart(2, '0');

const getDefaultReminderDate = () => {
  const nextHour = new Date(Date.now() + 60 * 60 * 1000);
  nextHour.setSeconds(0, 0);
  return nextHour;
};

const formatPickerDate = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatPickerTime = (date: Date) => {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getFileType = (mimeType?: string) => {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'file';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'file';
};

const fileNameFromUri = (uri: string, fallback: string) => {
  return uri.split('/').pop()?.split('?')[0] || fallback;
};

export default function DropScreen() {
  const { addItem, setMessage } = useQuickDrop();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reminderAt, setReminderAt] = useState<string | undefined>();
  const [showCustomReminder, setShowCustomReminder] = useState(false);
  const [selectedReminderDate, setSelectedReminderDate] = useState(getDefaultReminderDate);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const save = async () => {
    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();

    if (!trimmedContent && !trimmedTitle) {
      setMessage('Add a title or some content first.');
      return;
    }

    setIsSaving(true);
    const isUrl = looksLikeUrl(trimmedContent);
    const savedItem = await addItem({
      type: isUrl ? 'url' : 'text',
      title: trimmedTitle || (isUrl ? trimmedContent : 'Saved snippet'),
      url: isUrl ? trimmedContent : undefined,
      content: isUrl ? undefined : trimmedContent,
      tags: [],
      isStarred: false,
      isArchived: false,
      reminderAt,
    });

    if (savedItem?.reminderAt) {
      const wasScheduled = await scheduleQuickDropReminder({
        itemId: savedItem.id,
        title: savedItem.title,
        reminderAt: savedItem.reminderAt,
      });
      setMessage(
        wasScheduled
          ? 'Saved and reminder scheduled.'
          : getNotificationLoadError() || 'Saved. Notifications need a development build.'
      );
    }

    setTitle('');
    setContent('');
    setReminderAt(undefined);
    setIsSaving(false);
  };

  const remindTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    setReminderAt(date.toISOString());
    setMessage('Reminder set for tomorrow morning.');
  };

  const setCustomReminder = () => {
    if (selectedReminderDate.getTime() <= Date.now()) {
      setMessage('Reminder time must be in the future.');
      return;
    }

    setReminderAt(selectedReminderDate.toISOString());
    setMessage('Reminder time set.');
  };

  const handleReminderChange = (_event: DateTimePickerEvent, nextDate?: Date) => {
    setPickerMode(null);
    if (!nextDate) return;

    setSelectedReminderDate((current) => {
      const updated = new Date(current);

      if (pickerMode === 'date') {
        updated.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
      }

      if (pickerMode === 'time') {
        updated.setHours(nextDate.getHours(), nextDate.getMinutes(), 0, 0);
      }

      return updated;
    });
  };

  const saveUploadedAsset = async (asset: {
    dataUri?: string;
    uri: string;
    name: string;
    mimeType?: string;
    webFile?: Blob;
  }) => {
    setIsUploading(true);
    const upload = await uploadDocumentToCloudinary(asset);
    const savedItem = await addItem({
      type: getFileType(asset.mimeType),
      title: asset.name,
      fileUrl: upload.fileUrl,
      content: asset.mimeType ?? 'Uploaded file',
      tags: [],
      isStarred: false,
      isArchived: false,
    });

    if (savedItem) {
      setMessage('File uploaded and saved.');
    }
  };

  const pickMediaFile = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setMessage('Please allow photo access to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        base64: true,
        mediaTypes: ['images', 'videos'],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
      const dataUri = asset.base64 ? `data:${mimeType};base64,${asset.base64}` : undefined;

      await saveUploadedAsset({
        dataUri,
        uri: asset.uri,
        name: asset.fileName ?? fileNameFromUri(asset.uri, asset.type === 'video' ? 'video.mp4' : 'image.jpg'),
        mimeType,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Media upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const pickDocumentFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: '*/*',
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      await saveUploadedAsset({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        webFile: asset.file,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Screen>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.uploadBox}>
          <Text style={styles.uploadTitle}>File upload</Text>
          <Text style={styles.uploadText}>Upload images, PDFs, docs, and other files to Cloudinary, then save the URL in Firestore.</Text>
          <View style={styles.uploadActions}>
            <Pressable disabled={isUploading} onPress={pickMediaFile} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>{isUploading ? 'Uploading...' : 'Image / Video'}</Text>
            </Pressable>
            <Pressable disabled={isUploading} onPress={pickDocumentFile} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>{isUploading ? 'Uploading...' : 'PDF / Doc / Any'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Link / Snippet</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Title or description..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={title}
          />
          <TextInput
            multiline
            onChangeText={setContent}
            placeholder="Paste link, command, note, or copied text..."
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textarea]}
            value={content}
          />
          <View style={styles.quickRow}>
            <Pressable onPress={remindTomorrow} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Remind Tomorrow</Text>
            </Pressable>
            <Pressable onPress={() => setShowCustomReminder((value) => !value)} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Pick Date/Time</Text>
            </Pressable>
          </View>
          {showCustomReminder ? (
            <View style={styles.reminderPanel}>
              <View style={styles.pickerRow}>
                <Pressable onPress={() => setPickerMode('date')} style={styles.pickerButton}>
                  <Text style={styles.pickerLabel}>Date</Text>
                  <Text style={styles.pickerValue}>{formatPickerDate(selectedReminderDate)}</Text>
                </Pressable>
                <Pressable onPress={() => setPickerMode('time')} style={styles.pickerButton}>
                  <Text style={styles.pickerLabel}>Time</Text>
                  <Text style={styles.pickerValue}>{formatPickerTime(selectedReminderDate)}</Text>
                </Pressable>
              </View>
              <Pressable onPress={setCustomReminder} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Set Reminder</Text>
              </Pressable>
              {pickerMode ? (
                <DateTimePicker
                  mode={pickerMode}
                  value={selectedReminderDate}
                  minimumDate={new Date()}
                  is24Hour
                  onChange={handleReminderChange}
                />
              ) : null}
            </View>
          ) : null}
          {reminderAt ? <Text style={styles.reminder}>Reminder: {new Date(reminderAt).toLocaleString()}</Text> : null}
          <Pressable disabled={isSaving} onPress={save} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save to QuickDrop'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 110,
  },
  uploadBox: {
    alignItems: 'center',
    borderColor: '#8ee8bd',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 2,
    backgroundColor: colors.surface,
    padding: 26,
  },
  uploadTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  uploadText: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  uploadActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 14,
  },
  uploadButtonText: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: '#d8e3ef',
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  textarea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#f5f9ff',
    borderColor: '#c9d8e8',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  smallButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  reminder: {
    color: colors.warning,
    fontWeight: '800',
    marginTop: 10,
  },
  reminderPanel: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
    padding: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerButton: {
    backgroundColor: '#f8fbff',
    borderColor: '#d8e3ef',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  pickerValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 14,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
});
