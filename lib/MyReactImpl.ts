import { Fiber, MyReactElement, Hook } from '../types';

/**
 * MyReact: A simplified implementation of React's core algorithm.
 * 
 * Includes:
 * - Fiber Architecture
 * - Render & Commit Phases
 * - Reconciliation (Diffing)
 * - Hooks (useState, useEffect)
 * - Functional Components
 */

// --- Global State ---
let nextUnitOfWork: Fiber | null = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null; // Work In Progress Root
let deletions: Fiber[] = [];

// --- Hooks State ---
let wipFiber: Fiber | null = null;
let hookIndex: number = 0;

// --- 1. createElement (Virtual DOM) ---
function createElement(type: string | Function, props: any, ...children: any[]): MyReactElement {
  return {
    type,
    props: {
      ...props,
      // React handles "text" simply, but we flatten arrays to support .map() in JSX
      children: children.flat().map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: string | number): MyReactElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// --- 2. DOM Manipulation ---
function createDom(fiber: Fiber): HTMLElement | Text {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type as string);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" && !isEvent(key);
const isNew = (prev: any, next: any) => (key: string) => prev[key] !== next[key];
const isGone = (prev: any, next: any) => (key: string) => !(key in next);
const isStyle = (key: string) => key === "style";

function updateDom(dom: any, prevProps: any, nextProps: any) {
  // 1. Remove old event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 2. Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = "";
    });

  // 3. Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      if (name === "style" && typeof nextProps[name] === "object") {
        // Handle style objects like { color: 'red' }
        Object.assign(dom.style, nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // 4. Add new event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

// --- 3. Commit Phase ---
function commitRoot() {
  deletions.forEach(commitWork);
  if (wipRoot && wipRoot.child) {
    commitWork(wipRoot.child);
  }
  
  // After DOM manipulation, we run effects
  commitEffectHooks();

  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber: Fiber | undefined) {
  if (!fiber) {
    return;
  }

  // Find nearest DOM parent (functional components don't have DOM)
  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
    return; // Stop processing children of deleted node
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: Node) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // Recursively find child with DOM node
    if (fiber.child) {
      commitDeletion(fiber.child, domParent);
    }
  }
}

// Run useEffect hooks after commit
function commitEffectHooks() {
    function runEffects(fiber: Fiber | undefined) {
        if (!fiber) return;

        if (fiber.hooks) {
            fiber.hooks.forEach(hook => {
                if (hook.tag === 'EFFECT' && hook.hasChanged) {
                    // Run cleanup from previous render if it exists
                    if (hook.cancel) {
                        hook.cancel();
                    }
                    // Run new effect and store cleanup
                    if (hook.callback) {
                        hook.cancel = hook.callback();
                    }
                }
            });
        }
        
        runEffects(fiber.child);
        runEffects(fiber.sibling);
    }

    if (wipRoot && wipRoot.child) {
        runEffects(wipRoot.child);
    }
}

// --- 4. Render Entry ---
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

// --- 5. Work Loop ---
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

// Browser polyfill for requestIdleCallback
if (typeof window !== 'undefined') {
    const requestIdleCallback = window.requestIdleCallback || function(cb: any) {
        return setTimeout(() => {
            cb({
                timeRemaining: () => 1,
                didTimeout: false
            });
        }, 1);
    };
    requestIdleCallback(workLoop);
}

// --- 6. Reconciliation ---
function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

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

  const children = [(fiber.type as Function)(fiber.props)];
  reconcileChildren(fiber, children.flat());
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children.flat());
}

function reconcileChildren(wipFiber: Fiber, elements: MyReactElement[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: Fiber | null = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber: Fiber | undefined = undefined;

    const sameType = oldFiber && element && element.type === oldFiber.type;

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
      // PLACEMENT
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined,
        parent: wipFiber,
        alternate: undefined,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      // DELETION
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

// --- 7. Hooks Implementation ---

function useState<T>(initial: T): [T, (action: T | ((prev: T) => T)) => void] {
  const oldHook =
    wipFiber?.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook: Hook = {
    tag: 'STATE',
    state: oldHook ? oldHook.state : initial,
    queue: [] as any[],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions?.forEach((action: any) => {
    hook.state = typeof action === 'function' ? action(hook.state) : action;
  });

  const setState = (action: any) => {
    hook.queue?.push(action);
    // Trigger Re-render
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

function useEffect(callback: Function, deps?: any[]) {
    const oldHook = 
        wipFiber?.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex];

    const hasChanged = hasDepsChanged(oldHook ? oldHook.deps : undefined, deps);

    const hook: Hook = {
        tag: 'EFFECT',
        callback: callback,
        deps: deps,
        cancel: oldHook?.cancel,
        hasChanged: hasChanged
    };

    wipFiber?.hooks?.push(hook);
    hookIndex++;
}

function hasDepsChanged(prevDeps?: any[], nextDeps?: any[]) {
    if (!prevDeps || !nextDeps) return true;
    if (prevDeps.length !== nextDeps.length) return true;
    return nextDeps.some((dep, index) => dep !== prevDeps[index]);
}

// Export the engine
const MyReact = {
  createElement,
  render,
  useState,
  useEffect
};

export default MyReact;