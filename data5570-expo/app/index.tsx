import { useEffect, useState } from 'react';

import { Link, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { TaskList } from '@/components/TaskList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTask, fetchTasks } from '@/store/tasksSlice';

export default function Home() {
  // useState hook: tracks the text field before it becomes a task.
  const [text, setText] = useState('');

  const dispatch = useAppDispatch();
  const taskCount = useAppSelector((state) => state.tasks.items.length);
  const status = useAppSelector((state) => state.tasks.status);
  const error = useAppSelector((state) => state.tasks.error);

  // Loads the task list from the Django backend (GET /api/tasks/) once,
  // when this screen first mounts.
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

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
        <Text style={styles.subheading}>
          {status === 'loading' ? 'Loading tasks...' : `${taskCount} task(s)`}
        </Text>
        {status === 'loading' && <ActivityIndicator style={styles.spinner} />}
        {status === 'failed' && (
          <Text style={styles.error}>
            {error ?? 'Something went wrong talking to the server.'}
          </Text>
        )}

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
  spinner: {
    marginBottom: 12,
  },
  error: {
    color: '#e11d48',
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
