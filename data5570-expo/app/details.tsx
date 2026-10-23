import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { TaskList } from '@/components/TaskList';
import { useAppSelector } from '@/store/hooks';

export default function Details() {
  // Reads the same Redux store that the Home page writes to.
  const tasks = useAppSelector((state) => state.tasks.items);
  const completed = tasks.filter((task) => task.done).length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Details' }} />
      <Container>
        <Text style={styles.heading}>Task Summary</Text>
        <Text style={styles.stat}>Total: {tasks.length}</Text>
        <Text style={styles.stat}>Completed: {completed}</Text>
        <Text style={styles.stat}>Remaining: {tasks.length - completed}</Text>

        <TaskList />

        <Link href="/" asChild>
          <Button title="Back to Home" style={styles.backButton} />
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
    marginBottom: 12,
  },
  stat: {
    fontSize: 16,
    marginBottom: 4,
  },
  backButton: {
    marginTop: 24,
  },
});
