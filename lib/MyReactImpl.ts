import { Fiber, MyReactElement } from '../types';

/**
 * MyReact: A simplified implementation of React's core algorithm.
 * 
 * Core Concepts:
 * 1. createElement: Creates a Virtual DOM object.
 * 2. render: Starts the reconciliation process.
 * 3. Concurrent Mode / Fiber: Breaks work into units to avoid blocking the main thread.
 * 4. Reconciliation: Diffing the old fiber tree with the new one.
 * 5. Commit: Applying changes to the real DOM.
 * 6. Hooks: Managing state within fibers.
 */

// Global State for Work Loop
let nextUnitOfWork: Fiber | null = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null; // Work In Progress Root
let deletions: Fiber[] = [];

// Global State for Hooks
let wipFiber: Fiber | null = null;
let hookIndex: number = 0;

// 1. Create Element (Virtual DOM)
function createElement(type: string | Function, props: any, ...children: any[]): MyReactElement {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: string): MyReactElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 2. DOM Manipulation Helpers
function createDom(fiber: Fiber): HTMLElement | Text {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type as string);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) =>
  key !== "children" && !isEvent(key);
const isNew = (prev: any, next: any) => (key: string) =>
  prev[key] !== next[key];
const isGone = (prev: any, next: any) => (key: string) => !(key in next);

function updateDom(dom: any, prevProps: any, nextProps: any) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(
        eventType,
        prevProps[name]
      );
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(
        eventType,
        nextProps[name]
      );
    });
}

// 3. Commit Phase (Apply changes to DOM)
function commitRoot() {
  deletions.forEach(commitWork);
  if (wipRoot && wipRoot.child) {
      commitWork(wipRoot.child);
  }
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber: Fiber | undefined) {
  if (!fiber) {
    return;
  }

  // Find the nearest DOM parent (functional components don't have DOM nodes)
  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom);
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate?.props,
      fiber.props
    );
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: Node) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // If fiber is a function component, delete child
    if (fiber.child) {
        commitDeletion(fiber.child, domParent);
    }
  }
}

// 4. Render (Entry point)
function render(element: MyReactElement, container: HTMLElement) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 5. Work Loop (Concurrent Mode)
function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// Helper to start the loop in browser
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(workLoop);
}


// 6. Perform Unit of Work & Reconciliation
function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent =
    fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // Return next unit of work (Child -> Sibling -> Uncle)
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber: Fiber | undefined = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

function updateFunctionComponent(fiber: Fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  
  // Run the component function to get children
  const children = [(fiber.type as Function)(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber: Fiber, elements: MyReactElement[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: Fiber | null = null;

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index];
    let newFiber: Fiber | undefined = undefined;

    const sameType =
      oldFiber &&
      element &&
      element.type === oldFiber.type;

    if (sameType) {
      // UPDATE
      newFiber = {
        type: oldFiber!.type,
        props: element.props,
        dom: oldFiber!.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      // ADD
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined, // will be created
        parent: wipFiber,
        alternate: undefined,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      // DELETE
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber || null;
    index++;
  }
}

// 7. Hooks
function useState<T>(initial: T): [T, (action: T | ((prev: T) => T)) => void] {
  const oldHook =
    wipFiber?.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [] as any[],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action: any) => {
      // Handle functional updates
      if (typeof action === 'function') {
          hook.state = action(hook.state);
      } else {
          hook.state = action;
      }
  });

  const setState = (action: any) => {
    hook.queue.push(action);
    // Restart render from root
    if (currentRoot) {
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    }
  };

  wipFiber?.hooks?.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

// Export the library
const MyReact = {
  createElement,
  render,
  useState,
};

export default MyReact;