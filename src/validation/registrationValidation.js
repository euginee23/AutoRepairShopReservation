import * as yup from 'yup';

const registrationValidationSchema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    middleName: yup.string(),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    contactNumber: yup
        .string()
        .matches(/^\d{11}$/, 'Invalid contact number')
        .required('Contact Number is required'),
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
});

export default registrationValidationSchema;