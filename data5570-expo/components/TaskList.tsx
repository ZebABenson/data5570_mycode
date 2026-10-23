import { StyleSheet, Text, View } from 'react-native';

import { TaskItem } from '@/components/TaskItem';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeTask, toggleTask } from '@/store/tasksSlice';

// Parent component: reads the task list from Redux and renders one
// TaskItem (child) per task, passing down data and dispatch callbacks.
export const TaskList = () => {
  const tasks = useAppSelector((state) => state.tasks.items);
  const dispatch = useAppDispatch();

  if (tasks.length === 0) {
    return <Text style={styles.empty}>No tasks yet. Add one above.</Text>;
  }

  return (
    <View style={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          text={task.text}
          done={task.done}
          onToggle={() => dispatch(toggleTask(task.id))}
          onRemove={() => dispatch(removeTask(task.id))}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: 16,
  },
  empty: {
    marginTop: 16,
    color: '#999',
    textAlign: 'center',
  },
});
