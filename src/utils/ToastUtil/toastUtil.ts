import { toast } from "react-toastify";
import "./toastUtil.css";

export const successToast = (message: string) => {
  toast.success(message, {
    className: "toast",
  });
};

export const errorToast = (message: string) => {
  toast.error(message, {
    className: "toast",
  });
};

export const warningToast = (message: string) => {
  toast.warn(message, {
    className: "toast",
  });
};
