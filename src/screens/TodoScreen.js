import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, Text, TextInput, View } from "react-native";

import {
    createTodo,
    deleteTodo,
    getTodos,
    updateTodo,
} from "../services/todoApi";
import { addToQueue, processQueue } from "../storage/offlineQueue";

export default function TodoScreen() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  // Load todos on mount
  useEffect(() => {
    loadTodos();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
      if (state.isConnected) processQueue(createTodo);
    });

    return () => unsubscribe();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load todos");
    }
  };

  // Create todo (optimistic)
  const handleAddTodo = async () => {
    if (!title.trim()) return Alert.alert("Validation", "Todo title required");

    const newTodo = { title, completed: false, userId: 1 };

    // Optimistic UI
    setTodos([newTodo, ...todos]);
    setTitle("");

    if (!isOnline) {
      await addToQueue(newTodo);
      return;
    }

    try {
      const created = await createTodo(newTodo);
      setTodos([created, ...todos]);
    } catch (err) {
      Alert.alert("Error", "Failed to create todo");
    }
  };

  // Update todo
  const handleUpdateTodo = async (todo) => {
    const updated = { ...todo, title: todo.title + " (updated)" };

    // Optimistic UI
    setTodos(todos.map((t) => (t === todo ? updated : t)));

    if (!isOnline) {
      await addToQueue({ ...updated, offlineUpdate: true });
      return;
    }

    try {
      await updateTodo(todo.id, updated);
    } catch (err) {
      Alert.alert("Error", "Failed to update todo");
    }
  };

  // Delete todo
  const handleDeleteTodo = async (todo) => {
    // Optimistic UI
    setTodos(todos.filter((t) => t !== todo));

    if (!isOnline) {
      await addToQueue({ ...todo, offlineDelete: true });
      return;
    }

    try {
      await deleteTodo(todo.id);
    } catch (err) {
      Alert.alert("Error", "Failed to delete todo");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10 }}>
        {isOnline ? "Online" : "Offline"}
      </Text>

      <TextInput
        placeholder="New todo"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Add Todo" onPress={handleAddTodo} />

      <FlatList
        style={{ marginTop: 20 }}
        data={todos}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.title}</Text>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <Button title="Update" onPress={() => handleUpdateTodo(item)} />
              <View style={{ width: 10 }} />
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDeleteTodo(item)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
