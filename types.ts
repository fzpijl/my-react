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
  hooks?: any[];
}
