import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "OFFLINE_QUEUE";

export const addToQueue = async (action) => {
  try {
    const existing = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = existing ? JSON.parse(existing) : [];
    queue.push(action);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.log("Error adding to queue:", err);
  }
};

export const processQueue = async (apiCall) => {
  try {
    const existing = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = existing ? JSON.parse(existing) : [];

    for (let action of queue) {
      try {
        await apiCall(action);
      } catch (err) {
        console.log("Failed to sync action:", err);
      }
    }

    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (err) {
    console.log("Error processing queue:", err);
  }
};
