// Large union types that should use enumeration classes (>5 values)

// Large string literal unions
type USState = 
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "FL" | "GA"
  | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD"
  | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ"
  | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC"
  | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";

type Month = 
  | "January" | "February" | "March" | "April" | "May" | "June"
  | "July" | "August" | "September" | "October" | "November" | "December";

type HttpStatusCode = 
  | 200 | 201 | 202 | 203 | 204 | 205 | 206
  | 300 | 301 | 302 | 303 | 304 | 307 | 308
  | 400 | 401 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410
  | 500 | 501 | 502 | 503 | 504 | 505;

// Exactly 6 values (just over the boundary)
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type HexDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "A" | "B" | "C" | "D" | "E" | "F";

// Large mixed unions
type EventType = 
  | "click" | "dblclick" | "mousedown" | "mouseup" | "mousemove" | "mouseenter" | "mouseleave"
  | "keydown" | "keyup" | "keypress"
  | "focus" | "blur" | "change" | "input" | "submit"
  | "load" | "unload" | "resize" | "scroll";

// Using large unions in interfaces
interface Address {
  street: string;
  city: string;
  state: USState;
  zip: string;
}

interface DateSelector {
  month: Month;
  day: number;
  year: number;
}

interface ApiResponse {
  status: HttpStatusCode;
  message: string;
  data?: any;
}

// Type using multiple large unions
type RegionalSettings = {
  state: USState;
  defaultMonth: Month;
  preferredEvents: EventType[];
};

// Class with large union property
class GameDice {
  constructor(
    public sides: 4 | 6 | 8 | 10 | 12 | 20,
    public lastRoll?: DiceRoll
  ) {}
}

// Interface collecting various large unions
interface LargeUnionCollection {
  state: USState;
  month: Month;
  statusCode: HttpStatusCode;
  diceValue: DiceRoll;
  hexValue: HexDigit;
  eventType: EventType;
}

// Generic constrained by large union
type StateData<T extends USState> = {
  state: T;
  population: number;
  capital: string;
};