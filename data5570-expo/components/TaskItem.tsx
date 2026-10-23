import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TaskItemProps = {
  text: string;
  done: boolean;
  onToggle: () => void;
  onRemove: () => void;
};

// Child component: renders a single task row. Used (repeatedly) by TaskList.
export const TaskItem = ({ text, done, onToggle, onRemove }: TaskItemProps) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.textWrap} onPress={onToggle}>
        <Text style={[styles.text, done && styles.textDone]}>{text}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRemove} hitSlop={8}>
        <Text style={styles.remove}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  textWrap: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  remove: {
    color: '#e11d48',
    fontSize: 16,
    paddingHorizontal: 8,
  },
});
