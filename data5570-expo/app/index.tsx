import { useState } from 'react';

import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { TaskList } from '@/components/TaskList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTask } from '@/store/tasksSlice';

export default function Home() {
  // useState hook: tracks the text field before it becomes a task.
  const [text, setText] = useState('');

  const dispatch = useAppDispatch();
  const taskCount = useAppSelector((state) => state.tasks.items.length);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    dispatch(addTask(trimmed));
    setText('');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <Text style={styles.heading}>My Tasks</Text>
        <Text style={styles.subheading}>{taskCount} task(s)</Text>

        <TextInput
          style={styles.input}
          placeholder="What do you need to do?"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Button title="Add Task" onPress={handleAdd} />

        <TaskList />

        <Link href="/details" asChild>
          <Button title="Go to Details" style={styles.detailsButton} />
        </Link>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailsButton: {
    marginTop: 24,
  },
});
