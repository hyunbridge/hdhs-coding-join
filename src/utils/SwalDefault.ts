import Swal from "sweetalert2";

const swalDefault = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    confirmButton: "btn btn-dark btn-primary btn-lg mx-2",
    cancelButton: "btn btn-outline-dark btn-lg mx-2",
  },
  confirmButtonText: "확인",
  cancelButtonText: "취소",
  reverseButtons: true,
  heightAuto: false,
});

export default swalDefault;
