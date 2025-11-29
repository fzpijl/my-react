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
      children: children.flat().map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
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
    description: "To avoid blocking the main thread for large updates, React breaks the work into small units called 'Fibers'. We use `requestIdleCallback` to perform work only when the browser is idle.",
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
    description: "Reconciliation is the process of comparing the new element tree with the old fiber tree. We check if the type is the same. If yes, we update props. If not, we replace. This determines the `effectTag`.",
    highlight: "reconcileChildren",
    code: `function reconcileChildren(wipFiber, elements) {
  // ... loop over elements
  const sameType = oldFiber && element && element.type == oldFiber.type;

  if (sameType) {
    // UPDATE: Reuse DOM, update props
  }
  if (element && !sameType) {
    // PLACEMENT: Create new DOM
  }
  if (oldFiber && !sameType) {
    // DELETION: Remove DOM
  }
}`
  },
  {
    id: "hooks",
    title: "5. Hooks: useState",
    description: "Hooks rely on call order. We store them in a simple array on the fiber. `useState` checks if there is an existing hook at the current index. If so, it returns the state; otherwise, it initializes it.",
    highlight: "useState",
    code: `function useState(initial) {
  const oldHook = wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  
  // Apply queued updates...
  
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}`
  },
  {
    id: "useeffect",
    title: "6. Hooks: useEffect",
    description: "useEffect schedules side effects. We compare the dependency array with the previous render. If dependencies change, we flag the hook. We execute these effects AFTER the DOM has been committed to the screen.",
    highlight: "useEffect",
    code: `function useEffect(callback, deps) {
  const oldHook = wipFiber.alternate.hooks[hookIndex];
  const hasChanged = hasDepsChanged(oldHook?.deps, deps);

  const hook = {
    tag: 'EFFECT',
    callback,
    deps,
    hasChanged,
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
}

// In commitRoot...
if (hook.hasChanged) {
  hook.cancel && hook.cancel(); // Cleanup old
  hook.cancel = hook.callback(); // Run new
}`
  }
];