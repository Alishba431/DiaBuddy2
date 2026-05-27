import { Stack } from "expo-router";
import React from "react";
import { COLORS } from "@/constants/colors";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="character-select" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="parent-setup" />
    </Stack>
  );
}
