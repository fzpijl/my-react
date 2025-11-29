export interface Lesson {
  id: string;
  title: string;
  description: string;
  code: string;
  highlight: string; // Key concept to highlight
}

// MyReact specific types for the implementation
export interface MyReactElement {
  type: string | Function;
  props: {
    [key: string]: any;
    children: MyReactElement[];
  };
}

export type HookType = 'STATE' | 'EFFECT';

export interface Hook {
  tag: HookType;
  state?: any;        // For useState
  queue?: any[];      // For useState updates
  deps?: any[];       // For useEffect
  cancel?: Function;  // For useEffect cleanup
  callback?: Function;// For useEffect
  hasChanged?: boolean; // Track if deps changed
}

export interface Fiber {
  type?: string | Function;
  props: {
    [key: string]: any;
    children: MyReactElement[];
  };
  dom?: HTMLElement | Text | null;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber | null;
  effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  hooks?: Hook[];
}