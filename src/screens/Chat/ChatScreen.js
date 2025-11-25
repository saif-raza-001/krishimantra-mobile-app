import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform, ActivityIndicator, Alert, Modal, Image, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ML_SERVICE_URL } from '@env';

export default function ChatScreen({ visible, onClose }) {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const currentLanguage = useSelector((state) => state.auth.language);
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: t('chat.greeting', { name: user?.name || 'Farmer' }),
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const startNewChat = () => {
    Alert.alert(
      t('chat.newChat') + ' Chat',
      'Start a new conversation? Current chat will be cleared.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Start New',
          onPress: () => {
            setMessages([
              {
                id: Date.now().toString(),
                text: t('chat.greeting', { name: user?.name || 'Farmer' }),
                sender: 'bot',
                timestamp: new Date(),
              }
            ]);
          }
        }
      ]
    );
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/api/chat`,
        { 
          message: inputText,
          userName: user?.name || 'Farmer',
          language: currentLanguage
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000,
        }
      );

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply || "I'm having trouble responding. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. But I'm here to help with farming questions!",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        {!isUser && (
          <LinearGradient
            colors={['#4DD0E1', '#26C6DA']}
            style={styles.botAvatar}
          >
            <Text style={styles.botAvatarText}>✨</Text>
          </LinearGradient>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.botText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>

        {isUser && (
          <Image 
            source={{ uri: user?.profilePhoto || 'https://via.placeholder.com/35' }}
            style={styles.userAvatar}
          />
        )}
      </View>
    );
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  const quickQuestions = [
    t("chat.q1"),
    t("chat.q2"),
    t("chat.q3"),
    t("chat.q4"),
  ];

  const quickQuestionsOld = [
    "How to treat leaf blight?",
    "Best fertilizer for rice",
    "Soil pH for wheat",
    "When to irrigate crops?",
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  const showQuickQuestions = messages.length === 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <LinearGradient
          colors={['#4DD0E1', '#26C6DA', '#00ACC1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <LinearGradient
              colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.15)']}
              style={styles.aiOrb}
            >
              <Text style={styles.headerIcon}>✨</Text>
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{t('chat.title')}</Text>
              <Text style={styles.headerSubtitle}>{t('chat.subtitle')}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={startNewChat}
          >
            <View style={styles.newChatContent}>
              <Text style={styles.newChatIcon}>↻</Text>
              <Text style={styles.newChatText}>{t('chat.newChat')}</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <LinearGradient
              colors={['#4DD0E1', '#26C6DA']}
              style={styles.botAvatar}
            >
              <Text style={styles.botAvatarText}>✨</Text>
            </LinearGradient>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#26C6DA" />
              <Text style={styles.typingText}>{t('chat.thinking')}</Text>
            </View>
          </View>
        )}

        {showQuickQuestions && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>💡 {t('chat.quickQuestions')}:</Text>
            <View style={styles.quickQuestionsGrid}>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionChip}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('chat.placeholder')}
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim() === '' || isTyping}
          >
            <LinearGradient
              colors={inputText.trim() === '' ? ['#DDD', '#CCC'] : ['#4DD0E1', '#26C6DA']}
              style={styles.sendGradient}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  aiOrb: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerIcon: { fontSize: 24 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.95)', marginTop: 2 },
  newChatButton: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  newChatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newChatIcon: { 
    fontSize: 18, 
    color: '#fff',
    marginRight: 4,
    fontWeight: 'bold',
  },
  newChatText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  messagesList: { 
    paddingHorizontal: 15, 
    paddingTop: 15, 
    paddingBottom: 20,
    flexGrow: 1, 
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageContainer: { justifyContent: 'flex-end' },
  botMessageContainer: { justifyContent: 'flex-start' },
  botAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botAvatarText: { fontSize: 18 },
  userAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#4DD0E1',
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#4DD0E1',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  timestamp: { fontSize: 11, marginTop: 5 },
  userTimestamp: { color: 'rgba(255,255,255,0.85)', textAlign: 'right' },
  botTimestamp: { color: '#999' },
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 2,
  },
  typingText: { fontSize: 14, color: '#666', marginLeft: 10 },
  quickQuestionsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quickQuestionsTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#666', 
    marginBottom: 10 
  },
  quickQuestionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  quickQuestionChip: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4DD0E1',
  },
  quickQuestionText: { 
    fontSize: 13, 
    color: '#00838F', 
    fontWeight: '500' 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
});
