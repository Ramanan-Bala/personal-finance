import { Container, Section } from "@radix-ui/themes";
import React from "react";

interface LayoutContainerProps {
  children: React.ReactNode;
  size?: "1" | "2" | "3" | "4";
}

export function LayoutContainer({
  children,
  size = "4",
}: LayoutContainerProps) {
  return (
    <Section p={{ initial: "4", sm: "6" }}>
      <Container size={size}>{children}</Container>
    </Section>
  );
}
