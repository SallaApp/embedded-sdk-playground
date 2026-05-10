import { useCallback, useEffect, useRef, useState } from "react";
import logger from "../utils/logger.js";

const STATIC_TAB_ITEMS = [
  { title: "Test Console", value: "test-console", active: true },
  { title: "Playground", value: "playground", active: false },
  { title: "Addons", value: "addons", active: false },
];
const STATIC_TAB_VALUE_SET = new Set(
  STATIC_TAB_ITEMS.map((item) => item.value),
);

export function useNavSync({ embedded, isReady, setActiveTab, activeTab }) {
  const [addedItems, setAddedItems] = useState([]);
  const addedItemsRef = useRef([]);
  const staticItemIdsByValueRef = useRef({});
  const bootstrapStateRef = useRef("idle"); // idle | running | done
  const unsubscribeRef = useRef(() => {});
  const nextDynamicIndexRef = useRef(1);

  const nav = embedded?.nav;
  const hasNavApi =
    !!nav &&
    typeof nav.addNavItem === "function" &&
    typeof nav.updateNavItem === "function" &&
    typeof nav.removeNavItem === "function" &&
    typeof nav.onNavItemClick === "function";

  const activateStaticTab = useCallback(
    (value) => {
      if (!STATIC_TAB_VALUE_SET.has(value)) return;
      const id = staticItemIdsByValueRef.current[value];
      if (!id || !nav?.updateNavItem) return;
      nav.updateNavItem({ id, active: true });
    },
    [nav],
  );

  useEffect(() => {
    return () => {
      unsubscribeRef.current();
      unsubscribeRef.current = () => {};
      // remove items injected by this hook.
      const removeIds = [
        ...Object.values(staticItemIdsByValueRef.current),
        ...addedItemsRef.current.map((row) => row.id),
      ];
      removeIds.forEach((id) => {
        try {
          nav?.removeNavItem?.(id);
        } catch {
          /* no-op */
        }
      });
      staticItemIdsByValueRef.current = {};
      bootstrapStateRef.current = "idle";
    };
  }, [nav]);

  useEffect(() => {
    if (!isReady || !hasNavApi || bootstrapStateRef.current !== "idle") return;
    bootstrapStateRef.current = "running";
    let disposed = false;

    (async () => {
      try {
        const createdItems = [];
        for (const item of STATIC_TAB_ITEMS) {
          const created = await nav.addNavItem({
            title: item.title,
            value: item.value,
            url: "/apps/installed",
            active: item.active,
          });
          createdItems.push(created);
        }
        if (disposed) return;
        staticItemIdsByValueRef.current = createdItems.reduce((acc, row) => {
          acc[row.value] = row.id;
          return acc;
        }, {});
        unsubscribeRef.current();
        unsubscribeRef.current = nav.onNavItemClick(({ id, value, url }) => {
          if (!STATIC_TAB_VALUE_SET.has(value)) return;
          logger.debug("navbar click payload", { id, value, url });
          nav.updateNavItem({ id, active: true });
          setActiveTab(value);
        });
        bootstrapStateRef.current = "done";
        // One-shot: align with whichever tab the parent currently points at.
        activateStaticTab(activeTab);
      } catch (error) {
        bootstrapStateRef.current = "idle";
        logger.error("navbar bootstrap failed", error);
      }
    })();

    return () => {
      disposed = true;
    };
    // `activeTab` intentionally excluded — this effect bootstraps once; the
    // syncActiveTab effect handles subsequent tab changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activateStaticTab, hasNavApi, isReady, nav, setActiveTab]);

  const syncActiveTab = useCallback(
    (tab) => {
      if (!tab || !STATIC_TAB_VALUE_SET.has(tab)) return;
      activateStaticTab(tab);
    },
    [activateStaticTab],
  );

  const addDynamicItem = useCallback(async () => {
    if (!nav?.addNavItem) {
      throw new Error("nav.addNavItem is not available");
    }
    const index = nextDynamicIndexRef.current;
    const result = await nav.addNavItem({
      title: `Added Item ${index}`,
      value: `added-item-${index}`,
      url: "/apps/installed",
    });
    const nextItems = [...addedItemsRef.current, { id: result.id, n: index }];
    addedItemsRef.current = nextItems;
    setAddedItems(nextItems);
    nextDynamicIndexRef.current = index + 1;
    return { ...result, n: index };
  }, [nav]);

  const updateLatestDynamicItem = useCallback(async () => {
    if (!nav?.updateNavItem) {
      throw new Error("nav.updateNavItem is not available");
    }
    const latest = addedItemsRef.current[addedItemsRef.current.length - 1];
    if (!latest) {
      throw new Error("Nothing to update (add items first)");
    }
    nav.updateNavItem({
      id: latest.id,
      title: `Updated Item ${latest.n}`,
    });
    return latest;
  }, [nav]);

  const removeLatestDynamicItem = useCallback(async () => {
    if (!nav?.removeNavItem) {
      throw new Error("nav.removeNavItem is not available");
    }
    const latest = addedItemsRef.current[addedItemsRef.current.length - 1];
    if (!latest) {
      throw new Error("Nothing to remove (add items first)");
    }
    nav.removeNavItem(latest.id);
    const nextItems = addedItemsRef.current.slice(0, -1);
    addedItemsRef.current = nextItems;
    setAddedItems(nextItems);
    return latest;
  }, [nav]);

  return {
    addDynamicItem,
    updateLatestDynamicItem,
    removeLatestDynamicItem,
    syncActiveTab,
    addedItems,
  };
}
