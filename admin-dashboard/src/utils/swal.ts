import Swal from 'sweetalert2';

export const showSuccess = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: '#D4AF37',
    });
};

export const showError = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#D4AF37',
    });
};

export const showConfirm = (title: string, text?: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D4AF37',
        cancelButtonColor: '#6D6D6D',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    });
};

export default Swal;
