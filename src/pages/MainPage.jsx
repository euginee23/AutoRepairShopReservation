import React, { useState, useEffect } from 'react';
import '../css/MainPageStyle.css';
import axios from 'axios';

const HomeContent = () => {
  const [userReservations, setUserReservations] = useState([]);
  const [approvedReservations, setApprovedReservations] = useState([]);
  const [vehiclesOnApprovedReservations, setVehiclesOnApprovedReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReservations = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user-reservations', {
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
        const response = await axios.get('http://localhost:3001/api/user-approved-reservations', {
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
        const response = await axios.get('http://localhost:3001/api/vehicles-on-approved-reservations', {
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
              </div>
            ))}
          </ul>
        ) : (
          <p>No approved reservations found.</p>
        )}
      </div>

      <div className="reservation-box">
        <h2 className="reservation-box-title">Your vehicles that is currently being worked on</h2>
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
      // Exclude oldPassword and newPassword from profile update
      const { oldPassword, newPassword, ...profileData } = editedUserData;

      const response = await axios.put(
        'http://localhost:3001/api/update-profile',
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
        alert('Please enter the old password.');
        return;
      }

      const newPassword = editedUserData.newPassword || editedUserData.oldPassword;

      const loginData = {
        oldPassword: editedUserData.oldPassword,
        newPassword: newPassword,
        newUsername: editedUserData.username,
      };

      const response = await axios.put(
        'http://localhost:3001/api/change-login',
        loginData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setEditedUserData({
        ...editedUserData,
        oldPassword: '',
        newPassword: '',
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error changing login details:', error.response.data);
      alert('An error occurred while changing the login details. Please try again.');
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

      ) : (
        <p>No user information available.</p>
      )
      }
    </div >
  );
};

//BOOK RESERVATION CONTENT
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationData({
      ...reservationData,
      [name]: value,
    });
  };

  const handleBookReservation = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3001/api/book-reservation',
        reservationData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setReservationData({
        date: '',
        time: '',
        selectedServiceId: '',
        problemDescription: '',
        selectedVehicleId: '',
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error booking reservation:', error.response.data);
      alert('An error occurred while booking the reservation. Please try again.');
    }
  };

  const fetchUserVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user-vehicles', {
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
      const response = await axios.get('http://localhost:3001/api/services');
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
        <button type="button" onClick={handleBookReservation}>
          Book Reservation
        </button>
      </form>
    </div>
  );
};

// VEHICLE INFORMATION CONTENT
const YourVehiclesContent = () => {
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: 'petrol',
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
    if (
      newVehicle.make.trim() === '' ||
      newVehicle.model.trim() === '' ||
      newVehicle.year.trim() === '' ||
      newVehicle.mileage.trim() === '' ||
      newVehicle.vehicleType.trim() === '' ||
      newVehicle.plateNumber.trim() === ''
    ) {
      alert('Please fill in all required fields before adding a new vehicle.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/add-vehicle', newVehicle, {
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
        fuelType: 'petrol',
        vehicleType: '',
        plateNumber: '',
      });

      alert(response.data.message, 'vehicle added!');
    } catch (error) {
      console.error('Error adding vehicle:', error.response.data);
      alert('An error occurred while adding the vehicle. Please try again.');
    }
  };

  const carBrands = ['Isuzu', 'Mitsubishi', 'Toyota', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Nissan', 'Honda', 'Chevrolet', 'Mercedes-Benz', 'Jeep', 'Volvo'];

  const fetchUserVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user-vehicles', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching user vehicles:', error.message);
      alert('An error occurred while fetching user vehicles. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserVehicles();
  }, []);

  return (
    <div className="vehicle-content">
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
          <input
            type="text"
            name="year"
            value={newVehicle.year}
            onChange={handleChange}
          />
        </label>
        <label>
          Mileage:
          <input
            type="text"
            name="mileage"
            value={newVehicle.mileage}
            onChange={handleChange}
          />
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
            <option value="" disabled>Select a vehicle type</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="SUV">SUV</option>
            <option value="Crossover">Crossover</option>
            <option value="Commercial Truck">Commercial Truck</option>
            <option value="Commercial Van">Commercial Van</option>
            <option value="Passenger Van">Passenger Van</option>
            <option value="Jeep">Jeep</option>
          </select>
        </label>
        <label>
          Plate Number:
          <input
            type="text"
            name="plateNumber"
            value={newVehicle.plateNumber}
            onChange={handleChange}
          />
        </label>
        <button type="button" onClick={handleAddVehicle}>
          Add Vehicle
        </button>
      </form>

      <form className='vehicle_list'>
        {vehicles.length > 0 ? (
          <div>
            <h3>Your Vehicles List:</h3>
            <ul>
              {vehicles.map((vehicle, index) => (
                <li key={index}>
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                  <br />
                  Mileage: {vehicle.mileage} km
                  <br />
                  Fuel Type: {vehicle.fuel_type}
                  <br />
                  Vehicle Type: {vehicle.vehicle_type}
                  <br />
                  Plate Number: {vehicle.plate_number}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No vehicles added yet.</p>
        )}
      </form>
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
        const response = await axios.get('http://localhost:3001/api/pending-bills', {
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
        const response = await axios.get('http://localhost:3001/api/payment-history', {
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
                <p><span className="info-label">Transaction Date and Time:</span> <span className="info-value">{formatDate(history.created_at)} {formatTime(history.created_at)}</span></p>
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
          const response = await axios.get('http://localhost:3001/api/user', {
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
