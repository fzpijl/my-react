import { Lesson } from "./types";

export const LESSONS: Lesson[] = [
  {
    id: "intro",
    title: "1. The createElement Function",
    description: "In React, JSX compiles down to `createElement` calls. These calls don't create HTML directly; they create plain JavaScript objects called 'Virtual DOM' elements. These objects describe what we want to see on the screen.",
    highlight: "createElement",
    code: `function createElement(type, props, ...children) {
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

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}`
  },
  {
    id: "render",
    title: "2. The Render Function",
    description: "The render function is where the magic starts. We initialize the 'Work in Progress' (WIP) root. We don't build the whole DOM immediately. Instead, we set the next unit of work and let the Work Loop take over.",
    highlight: "render",
    code: `function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}`
  },
  {
    id: "workloop",
    title: "3. The Work Loop (Fiber)",
    description: "To avoid blocking the main thread for large updates, React breaks the work into small units called 'Fibers'. We use `requestIdleCallback` to perform work only when the browser is idle. If the browser needs to paint a frame or handle input, it pauses our loop.",
    highlight: "workLoop",
    code: `function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot(); // Done working, update real DOM
  }

  requestIdleCallback(workLoop);
}`
  },
  {
    id: "reconciliation",
    title: "4. Reconciliation & Diffing",
    description: "Reconciliation is the process of comparing the new element tree with the old fiber tree. We check if the type is the same. If yes, we update props. If not, we replace. This determines the `effectTag` (PLACEMENT, UPDATE, DELETION).",
    highlight: "reconcileChildren",
    code: `function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      // UPDATE: Keep DOM, update props
    }
    if (element && !sameType) {
      // PLACEMENT: Add new node
    }
    if (oldFiber && !sameType) {
      // DELETION: Remove node
    }
    // ... Move to next sibling
  }
}`
  },
  {
    id: "hooks",
    title: "5. Hooks (useState)",
    description: "Hooks allow functional components to have state. We store hooks in an array on the fiber. When a component re-renders, we access the hooks by index to retrieve the previous state.",
    highlight: "useState",
    code: `function useState(initial) {
  const oldHook = 
    wipFiber.alternate && 
    wipFiber.alternate.hooks && 
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  // Run pending actions from queue
  // ...

  const setState = action => {
    hook.queue.push(action);
    // Trigger re-render from root
    wipRoot = { ...currentRoot, alternate: currentRoot };
    nextUnitOfWork = wipRoot;
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}`
  }
];
