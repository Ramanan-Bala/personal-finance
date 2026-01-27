import { easeInOut, stagger } from "motion";

export const viewPortOnce = {
  viewport: { once: true, amount: 0.5 },
};
export const viewPortComplete = {
  viewport: { amount: 0.5 },
};

export const staggerContainerVariants = {
  variants: {
    hidden: {},
    visible: {
      transition: {
        duration: 0.5,
        delayChildren: stagger(0.1),
      },
    },
  },
  initial: "hidden",
  animate: "visible",
};

export const fadeInVariants = {
  variants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  initial: "hidden",
  animate: "visible",
  transition: { duration: 0.5, ease: easeInOut },
};

export const fadeScaleInVariants = {
  variants: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  initial: "hidden",
  animate: "visible",
  transition: { duration: 0.5, ease: easeInOut },
};

export const leftToRightVariants = {
  variants: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
};

export const bottomToTopVariants = {
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
};
