import React, { useState, useEffect } from 'react';
import '../css/MainPageStyle.css';
import apiUrl from '../../apiUrl';
import axios from 'axios';
import Swal from 'sweetalert2';

//HOME
const HomeContent = () => {
  const [userReservations, setUserReservations] = useState([]);
  const [approvedReservations, setApprovedReservations] = useState([]);
  const [vehiclesOnApprovedReservations, setVehiclesOnApprovedReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReservations = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user-reservations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setUserReservations(response.data);
      } catch (error) {
        console.error('Error fetching user reservations:', error.response.data);
      }
    };

    const fetchApprovedReservations = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user-approved-reservations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setApprovedReservations(response.data);
      } catch (error) {
        console.error('Error fetching approved reservations:', error.response.data);
      }
    };

    const fetchVehiclesOnApprovedReservations = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/vehicles-on-approved-reservations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setVehiclesOnApprovedReservations(response.data);
      } catch (error) {
        console.error('Error fetching vehicles on approved reservations:', error.response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReservations();
    fetchApprovedReservations();
    fetchVehiclesOnApprovedReservations();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Approved':
        return 'blue';
      case 'Done':
        return 'purple';
      case 'Completed':
        return 'green';
      case 'Cancelled':
        return 'red';
      case 'Declined':
        return 'red';
      default:
        return 'black';
    }
  };

  return (
    <div className="home-content">

      <div className="reservation-box">
        <h2 className="reservation-box-title">Your reservation history</h2>
        {loading ? (
          <p>Loading reservations...</p>
        ) : userReservations.length > 0 ? (
          <ul className="reservation-details-box">
            {userReservations.map((reservation) => (
              <div key={reservation.reservation_id} className="reservation-details">
                <p><span className="info-label">Date:</span> <span className="info-value">{formatDate(reservation.date)}</span></p>
                <p><span className="info-label">Time:</span> <span className="info-value">{formatTime(reservation.time)}</span></p>
                <p><span className="info-label">Service Needed:</span> <span className="info-value">{reservation.serviceType}</span></p>
                <p><span className="info-label">Vehicle:</span> <span className="info-value">{reservation.vehicle_make} {reservation.vehicle_model} ({reservation.vehicle_year})</span></p>
                <p><span className="info-label">Problem Description:</span> <span className="info-value">{reservation.problem_description}</span></p>
                <p><span className="info-label">Status:</span> <span className="info-value" style={{ color: getStatusColor(reservation.status) }}>{reservation.status}</span></p>
                {(reservation.status === 'Declined' || reservation.status === 'Cancelled') && (
                  <p><span className="info-label">Message:</span> <span className="info-value" style={{ color: getStatusColor(reservation.message) }}>{reservation.message}</span></p>
                )}
              </div>
            ))}
          </ul>
        ) : (
          <p>No reservations found.</p>
        )}
      </div>

      <div className="reservation-box">
        <h2 className="reservation-box-title">Reservations being currently worked on</h2>
        {loading ? (
          <p>Loading approved reservations...</p>
        ) : approvedReservations.length > 0 ? (
          <ul>
            {approvedReservations.map((approvedReservation) => (
              <div key={approvedReservation.reservation_id} className="reservation-details">
                <p><span className="info-label">Date:</span> <span className="info-value">{formatDate(approvedReservation.date)}</span></p>
                <p><span className="info-label">Time:</span> <span className="info-value">{formatTime(approvedReservation.time)}</span></p>
                <p><span className="info-label">Service Needed:</span> <span className="info-value">{approvedReservation.serviceType}</span></p>
                <p><span className="info-label">Vehicle:</span> <span className="info-value">{approvedReservation.vehicle_make} {approvedReservation.vehicle_model} ({approvedReservation.vehicle_year})</span></p>
                <p><span className="info-label">Problem Description:</span> <span className="info-value">{approvedReservation.problem_description}</span></p>
                <p><span className="info-label">Status:</span> <span className="info-value" style={{ color: getStatusColor(approvedReservation.status) }}>{approvedReservation.status}</span></p>
                {(approvedReservation.status === 'Declined' || approvedReservation.status === 'Cancelled') && (
                  <p><span className="info-label">Message:</span> <span className="info-value" style={{ color: getStatusColor(approvedReservation.message) }}>{approvedReservation.message}</span></p>
                )}
              </div>
            ))}
          </ul>
        ) : (
          <p>No approved reservations found.</p>
        )}
      </div>

      <div className="reservation-box">
        <h2 className="reservation-box-title">Your vehicles that are currently being worked on</h2>
        {vehiclesOnApprovedReservations.length > 0 ? (
          <ul>
            {vehiclesOnApprovedReservations.map((vehicle) => (
              <div key={vehicle.vehicle_id} className="reservation-details">
                <p><span className="info-label">Make:</span> <span className="info-value">{vehicle.make}</span></p>
                <p><span className="info-label">Model:</span> <span className="info-value">{vehicle.model}</span></p>
                <p><span className="info-label">Year:</span> <span className="info-value">{vehicle.year}</span></p>
                <p><span className="info-label">Mileage:</span> <span className="info-value">{vehicle.mileage}</span></p>
                <p><span className="info-label">Fuel Type:</span> <span className="info-value">{vehicle.fuel_type}</span></p>
                <p><span className="info-label">Vehicle Type:</span> <span className="info-value">{vehicle.vehicle_type}</span></p>
                <p><span className="info-label">Plate Number:</span> <span className="info-value">{vehicle.plate_number}</span></p>
              </div>
            ))}
          </ul>
        ) : (
          <p>No vehicles found on approved reservations.</p>
        )}
      </div>

    </div>
  );
};


//EDIT PROFILE CONTENT
const ProfileSettingsContent = ({ userData, loading, error }) => {
  const [editedUserData, setEditedUserData] = useState({
    ...userData,
    oldPassword: '',
    newPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData({
      ...editedUserData,
      [name]: value,
    });
  };

  const handleUpdateProfile = async () => {
    try {
      const { oldPassword, newPassword, ...profileData } = editedUserData;

      const response = await axios.put(
        `${apiUrl}/api/update-profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert(response.data.message);
    } catch (error) {
      console.error('Error updating profile:', error.response.data);
      alert('An error occurred while updating the profile. Please try again.');
    }
  };

  const handleChangeLogin = async () => {
    try {
      if (!editedUserData.oldPassword) {
        Swal.fire('Error', 'Please enter the old password.', 'error');
        return;
      }

      const newPassword = editedUserData.newPassword || editedUserData.oldPassword;

      const loginData = {
        oldPassword: editedUserData.oldPassword,
        newPassword: newPassword,
        newUsername: editedUserData.username,
      };

      const response = await axios.put(
        `${apiUrl}/api/change-login`,
        loginData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.error === 'Username already exists') {
        Swal.fire('Error', 'Username already exists.', 'error');
        return;
      }

      setEditedUserData({
        ...editedUserData,
        oldPassword: '',
        newPassword: '',
      });

      alert(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Swal.fire('Error', 'Wrong password.', 'error');
      } else {
        console.error('Error changing login details:', error.response.data);
        Swal.fire('Error', 'An error occurred while changing the login details. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="profile-content">
      {loading ? (
        <p>Loading user information...</p>
      ) : error ? (
        <div>
          <p>{error}</p>
        </div>
      ) : userData ? (
        <div>

          <div className="reservation-box">
            <h2>Edit Profile</h2>
            <form>
              <div>
                <label>
                  First Name:
                  <input
                    type="text"
                    name="firstName"
                    value={editedUserData.firstName}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <label>
                  Middle Name (Optional):
                  <input
                    type="text"
                    name="middleName"
                    value={editedUserData.middleName}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <label>
                  Last Name:
                  <input
                    type="text"
                    name="lastName"
                    value={editedUserData.lastName}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={editedUserData.email}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <label>
                  Contact Number:
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editedUserData.contactNumber}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </form>

            <h2>Your Address</h2>
            <form>
              <div>
                <label>
                  Address:
                  <input
                    type="text"
                    name="address"
                    value={editedUserData.address}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <button type="button" onClick={handleUpdateProfile}>
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          <div className="reservation-box">

            <h2>Edit Login Details</h2>

            <form>
              <div>
                <label>
                  Username:
                  <input
                    type="text"
                    name="username"
                    value={editedUserData.username}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <label>
                  Old Password:
                  <input
                    type="password"
                    name="oldPassword"
                    value={editedUserData.oldPassword}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <label>
                  New Password:
                  <input
                    type="password"
                    name="newPassword"
                    value={editedUserData.newPassword}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div>
                <button type="button" onClick={handleChangeLogin}>
                  Change Password
                </button>
              </div>
            </form>
          </div>

        </div>

      ) : (
        <p>No user information available.</p>
      )
      }
    </div >
  );
};

const BookReservationContent = () => {
  const [reservationData, setReservationData] = useState({
    date: '',
    time: '',
    selectedServiceId: '',
    problemDescription: '',
    selectedVehicleId: '',
  });

  const [userVehicles, setUserVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingBookReservation, setLoadingBookReservation] = useState(false); // Add loading state for booking reservation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationData({
      ...reservationData,
      [name]: value,
    });
  };

  const handleBookReservation = async () => {
    if (!reservationData.date || !reservationData.time || !reservationData.selectedServiceId || !reservationData.problemDescription || !reservationData.selectedVehicleId) {
      alert('Please fill in all required fields before booking the reservation.');
      return;
    }

    setLoadingBookReservation(true);

    try {
      const response = await axios.post(`${apiUrl}/api/book-reservation`, reservationData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setReservationData({
        date: '',
        time: '',
        selectedServiceId: '',
        problemDescription: '',
        selectedVehicleId: '',
      });

      Swal.fire('Success', response.data.message, 'success');
    } catch (error) {
      console.error('Error booking reservation:', error.response.data);
      Swal.fire('Error', 'An error occurred while booking the reservation. Please try again.', 'error');
    } finally {
      setLoadingBookReservation(false);
    }
  };

  const fetchUserVehicles = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/user-vehicles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setUserVehicles(response.data);
    } catch (error) {
      console.error('Error fetching user vehicles:', error.message);
      alert('An error occurred while fetching user vehicles. Please try again.');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error.message);
      alert('An error occurred while fetching services. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserVehicles();
    fetchServices();
  }, []);

  return (
    <div className="reservation-content">
      {loadingBookReservation && (
        <div className="loading-overlay">
          <h1>Loading...</h1>
        </div>
      )}
      <div className="reservation-box">
        <h2>Book a Reservation</h2>
        <form>
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={reservationData.date}
              onChange={handleChange}
            />
          </label>
          <label>
            Time:
            <input
              type="time"
              name="time"
              value={reservationData.time}
              onChange={handleChange}
            />
          </label>
          <label>
            Select Service:
            <select
              name="selectedServiceId"
              value={reservationData.selectedServiceId}
              onChange={handleChange}
            >
              <option value="" disabled>Select a service</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.serviceType}
                </option>
              ))}
            </select>
          </label>
          <label>
            Problem Description:
            <textarea
              name="problemDescription"
              value={reservationData.problemDescription}
              onChange={handleChange}
            />
          </label>
          <label>
            Select Vehicle:
            <select
              name="selectedVehicleId"
              value={reservationData.selectedVehicleId}
              onChange={handleChange}
            >
              <option value="" disabled>Select a vehicle</option>
              {userVehicles.map((vehicle) => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {`${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.plate_number}`}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={handleBookReservation} disabled={loadingBookReservation}>
            {loadingBookReservation ? 'Booking...' : 'Book Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
};


//YOUR VEHICLES CONTENT
const YourVehiclesContent = () => {
  const [loading, setLoading] = useState(false);
  const [loadingAddVehicle, setLoadingAddVehicle] = useState(false);
  const [loadingRemoveVehicle, setLoadingRemoveVehicle] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: 'Petrol',
    vehicleType: '',
    plateNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({
      ...newVehicle,
      [name]: value,
    });
  };

  const handleAddVehicle = async () => {
    if (newVehicle.make.trim() === '') {
      alert('Please select a car brand.');
      return;
    }
  
    if (newVehicle.model.trim() === '') {
      alert('Please enter the model.');
      return;
    }
  
    if (newVehicle.year.trim() === '') {
      alert('Please select a year.');
      return;
    }
  
    if (newVehicle.mileage.trim() === '') {
      alert('Please drag the mileage slider.');
      return;
    }
  
    if (newVehicle.vehicleType.trim() === '') {
      alert('Please select the vehicle type.');
      return;
    }
  
    if (newVehicle.plateNumber.trim() === '') {
      alert('Please enter the plate number.');
      return;
    }
  
    if (newVehicle.plateNumber.length !== 7) {
      alert('Plate number should be 7 characters long.');
      return;
    }
  
    const plateCode = newVehicle.plateNumber.substring(0, 3);
    const plateNumber = newVehicle.plateNumber.substring(3);
  
    if (!/^[A-Za-z]+$/.test(plateCode)) {
      alert('Plate code should contain only letters.');
      return;
    }
  
    if (!/^\d+$/.test(plateNumber)) {
      alert('Plate number should contain only numbers.');
      return;
    }
  
    setLoadingAddVehicle(true); 
  
    try {
      const response = await axios.post(`${apiUrl}/api/add-vehicle`, newVehicle, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      setVehicles([...vehicles, newVehicle]);
  
      setNewVehicle({
        make: '',
        model: '',
        year: '',
        mileage: '',
        fuelType: 'Petrol',
        vehicleType: '',
        plateNumber: '',
      });
  
      alert(response.data.message, 'vehicle added!');
    } catch (error) {
      console.error('Error adding vehicle:', error.response.data);
      alert('An error occurred while adding the vehicle. Please try again.');
    } finally {
      setLoadingAddVehicle(false); 
    }
  };

  const handleRemoveVehicle = async (index) => {
    const isConfirmed = window.confirm('Are you sure you want to remove this vehicle?');

    if (!isConfirmed) {
      return;
    }

    setLoadingRemoveVehicle(true); // Set loading state for removing vehicle

    try {
      await axios.delete(`${apiUrl}/api/remove-vehicle/${index}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const updatedVehicles = [...vehicles];
      updatedVehicles.splice(index, 1);
      setVehicles(updatedVehicles);
      fetchUserVehicles();
      alert('Vehicle removed successfully!');
    } catch (error) {
      console.error('Error removing vehicle:', error.response.data);
      alert('An error occurred while removing the vehicle. Please try again.');
    } finally {
      setLoadingRemoveVehicle(false); // Reset loading state for removing vehicle
    }
  };

  const carBrands = ['Isuzu', 'Mitsubishi', 'Toyota', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Nissan', 'Honda', 'Chevrolet', 'Mercedes-Benz', 'Jeep', 'Volvo'];
  const yearRange = Array.from({ length: new Date().getFullYear() - 1969 }, (_, i) => new Date().getFullYear() - i);

  const fetchUserVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/user-vehicles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user vehicles:', error.message);
      alert('An error occurred while fetching user vehicles. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVehicles();
  }, []);

  return (
    <div className="vehicle-content">
      {loading && (
        <div className="loading-overlay">
          <h1>Loading...</h1>
        </div>
      )}
      <div className="reservation-box">
        <h2>Your Vehicles</h2>
        <form>
          <label>
            Make:
            <select
              name="make"
              value={newVehicle.make}
              onChange={handleChange}
            >
              <option value="" disabled>Select a car brand</option>
              {carBrands.map((brand, index) => (
                <option key={index} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model:
            <input
              type="text"
              name="model"
              value={newVehicle.model}
              onChange={handleChange}
            />
          </label>
          <label>
            Year:
            <select
              name="year"
              value={newVehicle.year}
              onChange={handleChange}
            >
              <option value="" disabled>Select a year</option>
              {yearRange.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mileage:
            <input
              type="range"
              name="mileage"
              min="0"
              max="1000000"
              step="1000"
              value={newVehicle.mileage}
              onChange={handleChange}
            />
            <h3>{newVehicle.mileage} km</h3>
          </label>
          <label>
            Fuel Type:
            <select
              name="fuelType"
              value={newVehicle.fuelType}
              onChange={handleChange}
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
            </select>
          </label>
          <label>
            Vehicle Type:
            <select
              name="vehicleType"
              value={newVehicle.vehicleType}
              onChange={handleChange}
            >
              <option value="">Select a vehicle type</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Pick Up">Pick Up</option>
              <option value="Commercial Truck">Commercial Truck</option>
              <option value="Commercial Van">Commercial Van</option>
              <option value="Passenger Van">Passenger Van</option>
              <option value="Crossover">Crossover</option>
              <option value="SUV">SUV</option>
              <option value="Jeep / Off Roader">Jeep / Off Roader</option>
            </select>
          </label>
          <label>Plate Information:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '20px' }}>
              Code:
              <input
                type="text"
                name="plateCode"
                value={newVehicle.plateNumber.substring(0, 3)} 
                onChange={(e) => handleChange({ target: { name: 'plateNumber', value: e.target.value.toUpperCase() + newVehicle.plateNumber.substring(3) } })}
                maxLength="3"
                style={{ textTransform: 'uppercase' }}
              />
            </label>
            <label>
              Number:
              <input
                type="text"
                name="plateNumber"
                value={newVehicle.plateNumber.substring(3)} 
                onChange={(e) => handleChange({ target: { name: 'plateNumber', value: newVehicle.plateNumber.substring(0, 3) + e.target.value } })} 
                maxLength="4"
              />
            </label>
          </div>
          <button type="button" onClick={handleAddVehicle} disabled={loadingAddVehicle}>
            {loadingAddVehicle ? 'Adding Vehicle...' : 'Add Vehicle'}
          </button>
        </form>
      </div>

      <div className="reservation-box">
        <div className="vehicle-list-table">
          <form className='vehicle_list'>
            {vehicles.length > 0 ? (
              <div>
                <h3>Your Vehicles List:</h3>
                <ul>
                  {vehicles.map((vehicle) => (
                    <li key={`${vehicle.make}-${vehicle.model}-${vehicle.year}`}>
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                      <br />
                      Mileage: {vehicle.mileage} km
                      <br />
                      Fuel Type: {vehicle.fuel_type}
                      <br />
                      Vehicle Type: {vehicle.vehicle_type}
                      <br />
                      Plate Number: {vehicle.plate_number}
                      <br />
                      <button type="button" onClick={() => handleRemoveVehicle(vehicle.vehicle_id)} disabled={loadingRemoveVehicle}>
                        {loadingRemoveVehicle ? 'Removing...' : 'Remove'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No vehicles added yet.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};


// BILLS AND PAYMENT CONTENT
const BillsPaymentContent = () => {
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchPendingBills = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/pending-bills`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setPendingBills(response.data);
      } catch (error) {
        console.error('Error fetching pending bills:', error.response.data);
      } finally {
        setLoading(false);
      }
    };

    const fetchPaymentHistory = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/payment-history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setPaymentHistory(response.data);
      } catch (error) {
        console.error('Error fetching payment history:', error.response.data);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchPaymentHistory();
    fetchPendingBills();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  return (
    <div className="home-content">

      <div className="reservation-box">
        <h2 className="pending-bill-title">Pending Bills</h2>
        {loading ? (
          <p>Loading pending bills...</p>
        ) : pendingBills.length > 0 ? (
          <ul>
            {pendingBills.map((bill) => (
              <li key={bill.billing_id} className="pending-bill-details">
                <p><span className="info-label">Date:</span> <span className="info-value">{formatDate(bill.date)}</span></p>
                <p><span className="info-label">Time:</span> <span className="info-value">{formatTime(bill.time)}</span></p>
                <p><span className="info-label">Service Type:</span> <span className="info-value">{bill.serviceType}</span></p>
                <p><span className="info-label">Vehicle:</span> <span className="info-value">{bill.make} {bill.model} ({bill.year})</span></p>
                <p><span className="info-label">Extra Expense Reason:</span> <span className="info-value">{bill.extraExpense_reason}</span></p>
                <p><span className="info-label">Extra Expense Cost:</span> <span className="info-value">{bill.extraExpense_cost}</span></p>
                <p><span className="info-label">Total Cost:</span> <span className="info-value">{bill.total_cost}</span></p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending bills found.</p>
        )}
      </div>

      <div className="payment-bill-history-box">
        <h2 className="pending-bill-title" >Payment History</h2>
        {loadingHistory ? (
          <p>Loading payment history...</p>
        ) : paymentHistory.length > 0 ? (
          <ul>
            {paymentHistory.map((history) => (
              <li key={history.invoice_id} className="pending-bill-details">
                <p><span className="info-label">Date:</span> <span className="info-value">{formatDate(history.date)}</span></p>
                <p><span className="info-label">Time:</span> <span className="info-value">{formatTime(history.time)}</span></p>
                <p><span className="info-label">Service Type:</span> <span className="info-value">{history.serviceType}</span></p>
                <p><span className="info-label">Vehicle:</span> <span className="info-value">{history.make} {history.model} ({history.year})</span></p>
                <p><span className="info-label">Customer Name:</span> <span className="info-value">{history.customerName}</span></p>
                <p><span className="info-label">Service Done:</span> <span className="info-value">{history.serviceDone}</span></p>
                <p><span className="info-label">Extra Cost Reason:</span> <span className="info-value">{history.extraCost_reason}</span></p>
                <p><span className="info-label">Extra Cost:</span> <span className="info-value">{history.extraCost}</span></p>
                <p><span className="info-label">Total Cost:</span> <span className="info-value">{history.totalCost}</span></p>
                <p><span className="info-label">Transaction Date:</span> <span className="info-value">{formatDate(history.created_at)}</span></p>
                <img src={`data:image/png;base64,${history.receipt_Image}`} alt="Receipt" style={{ maxWidth: '100%' }} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No payment history found.</p>
        )}
      </div>
    </div>
  );
};

//Main & Navigation
const MainPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('homeContent');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const response = await axios.get(`${apiUrl}/api/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user information:', error.response.data);
        setError('Error fetching user information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettingsContent userData={userData} loading={loading} error={error} />;
      case 'bookReservation':
        return <BookReservationContent />;
      case 'yourVehicles':
        return <YourVehiclesContent />;
      case 'homeContent':
        return <HomeContent />;
      case 'bills&paymentHistory':
        return <BillsPaymentContent />
      default:
        return null;
    }
  };

  return (
    <div className="main-page">
      <div className="sidebar">
        <h2>Welcome {userData && userData.firstName} {userData && userData.lastName}!</h2>
        <div className={`tab ${activeTab === 'homeContent' && 'active'}`} onClick={() => handleTabClick('homeContent')}>
          Home
        </div>
        <div className={`tab ${activeTab === 'profile' && 'active'}`} onClick={() => handleTabClick('profile')}>
          Edit Profile
        </div>
        <div className={`tab ${activeTab === 'bookReservation' && 'active'}`} onClick={() => handleTabClick('bookReservation')}>
          Book a Reservation
        </div>
        <div className={`tab ${activeTab === 'yourVehicles' && 'active'}`} onClick={() => handleTabClick('yourVehicles')}>
          Your Vehicles
        </div>
        <div className={`tab ${activeTab === 'bills&paymentHistory' && 'active'}`} onClick={() => handleTabClick('bills&paymentHistory')}>
          Bills and Payment History
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default MainPage;
