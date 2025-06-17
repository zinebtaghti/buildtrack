import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

export function DatePicker({ value, onChange, onClose }: DatePickerProps) {
  const [currentDate, setCurrentDate] = React.useState(value || new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const handlePrevYear = () => {
    setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
  };
  
  const handleNextYear = () => {
    setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
  };
  
  const renderCalendar = () => {
    const days = [];
    const weeks = [];
    let week = [];
    
    // Add empty days for the beginning of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      week.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = date.toDateString() === value.toDateString();
      
      week.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isSelected && styles.selectedDay]}
          onPress={() => {
            onChange(date);
            onClose();
          }}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
      
      if (week.length === 7) {
        weeks.push(
          <View key={weeks.length} style={styles.weekRow}>
            {week}
          </View>
        );
        week = [];
      }
    }
    
    // Add the remaining days
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(<View key={`empty-end-${week.length}`} style={styles.dayCell} />);
      }
      weeks.push(
        <View key={weeks.length} style={styles.weekRow}>
          {week}
        </View>
      );
    }
    
    return weeks;
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.navigationControls}>
              <TouchableOpacity onPress={handlePrevYear} style={styles.navButton}>
                <ChevronLeft size={20} color="#1F2937" />
                <ChevronLeft size={20} color="#1F2937" style={styles.secondChevron} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                <ChevronLeft size={20} color="#1F2937" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.monthText}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            
            <View style={styles.navigationControls}>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                <ChevronRight size={20} color="#1F2937" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextYear} style={styles.navButton}>
                <ChevronRight size={20} color="#1F2937" />
                <ChevronRight size={20} color="#1F2937" style={styles.secondChevron} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.calendar}>
            <View style={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>
            {renderCalendar()}
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondChevron: {
    marginLeft: -12,
  },
  monthText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  calendar: {
    marginBottom: 16,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  selectedDay: {
    backgroundColor: '#2196F3',
  },
  selectedDayText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});