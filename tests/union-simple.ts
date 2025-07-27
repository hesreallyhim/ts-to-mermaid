// Simple union types that should use inline annotations (≤5 values)

// Basic string literal unions
type Size = "small" | "medium" | "large";
type Status = "active" | "inactive";
type YesNo = "yes" | "no";

// Basic number literal unions
type Rating = 1 | 2 | 3 | 4 | 5;
type Priority = 0 | 1 | 2;
type HttpSuccessCodes = 200 | 201 | 204;

// Boolean unions
type TrueFalse = true | false;
type MaybeBool = boolean | null;

// Mixed simple unions (still ≤5 values)
type Toggle = "on" | "off" | 1 | 0;
type Answer = "yes" | "no" | true | false;

// Exactly 5 values (boundary case)
type Direction = "north" | "south" | "east" | "west" | "center";
type Weekday = "mon" | "tue" | "wed" | "thu" | "fri";

// Using simple unions in interfaces
interface UserSettings {
  theme: "light" | "dark";
  language: "en" | "es" | "fr";
  size: Size;
  autoSave: YesNo;
  priority: Priority;
}

interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size: "sm" | "md" | "lg";
  disabled?: boolean;
}

// Type with all inline unions
type Config = {
  mode: "dev" | "prod" | "test";
  level: 1 | 2 | 3;
  feature: "basic" | "pro";
  status: Status;
};

// Class using simple unions
class MenuItem {
  constructor(
    public label: string,
    public type: "link" | "button" | "divider",
    public position: "left" | "right" | "center"
  ) {}
}

// Nested object with simple unions
interface Navigation {
  position: "top" | "bottom" | "left" | "right";
  items: {
    type: "link" | "dropdown" | "search";
    align: "start" | "center" | "end";
    visible: true | false;
  }[];
}

// Generic with simple union constraint
type SimpleOption<T extends "a" | "b" | "c"> = {
  value: T;
  label: string;
};

// All properties should render with inline unions
interface AllSimpleUnions {
  size: Size;
  status: Status;
  yesNo: YesNo;
  rating: Rating;
  priority: Priority;
  httpCode: HttpSuccessCodes;
  bool: TrueFalse;
  maybe: MaybeBool;
  toggle: Toggle;
  answer: Answer;
  direction: Direction;
  weekday: Weekday;
}