import { reload } from "../coolPeople";

export const registerGistReload = async () => {
  const interval = setInterval(async () => {
    !(await reload()) ? clearInterval(interval) : null;
  }, 3600000);

  return interval;
};
