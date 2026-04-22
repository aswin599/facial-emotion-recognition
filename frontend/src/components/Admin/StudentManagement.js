import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const ITEMS_PER_PAGE = 15;

  // Load students
  useEffect(() => {
    loadStudents();
  }, [currentPage, sortBy]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers(
        currentPage,
        ITEMS_PER_PAGE,
        searchQuery
      );
      if (response.success) {
        setStudents(response.data.users);
        setTotalPages(response.data.pages);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load students');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        loadStudents();
      } else if (searchQuery === '') {
        loadStudents();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle user status
  const handleStatusChange = async (studentId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(studentId, !currentStatus);
      // Reload students
      loadStudents();
    } catch (err) {
      setError(err.message || 'Failed to update student status');
    }
  };

  // View student details
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Get status badge color
  const getStatusColor = (isActive) => {
    return isActive ? '#22c55e' : '#ef4444';
  };

  // Get status text
  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Student Management</h2>
        <p>Total: {students.length > 0 ? `Showing ${students.length}` : 'No students'}</p>
      </div>

      {error && (
        <div className="admin-alert error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="search-input"
          value={searchQuery}
          onChange={handleSearch}
        />
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="createdAt">Newest First</option>
          <option value="name">Name A-Z</option>
          <option value="email">Email A-Z</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roll No</th>
                  <th>Status</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="student-row">
                    <td>
                      <div className="student-name">
                        <div className="student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.rollNo || '-'}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: `${getStatusColor(student.isActive)}20`,
                          color: getStatusColor(student.isActive)
                        }}
                      >
                        {getStatusText(student.isActive)}
                      </span>
                    </td>
                    <td>{student.departments?.join(', ') || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-small btn-view"
                          onClick={() => handleViewDetails(student)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-small btn-toggle"
                          onClick={() => handleStatusChange(student._id, student.isActive)}
                          title={student.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {student.isActive ? '✓' : '✗'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>No students found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <p>{selectedStudent.name}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedStudent.email}</p>
                </div>
                <div className="detail-item">
                  <label>Roll Number</label>
                  <p>{selectedStudent.rollNo || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Father's Name</label>
                  <p>{selectedStudent.fatherName || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <p>{selectedStudent.dob || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Mobile</label>
                  <p>{selectedStudent.mobile || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <p>{selectedStudent.gender || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Department</label>
                  <p>{selectedStudent.departments?.join(', ') || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Course</label>
                  <p>{selectedStudent.course || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>City</label>
                  <p>{selectedStudent.city || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Address</label>
                  <p>{selectedStudent.address || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(selectedStudent.isActive)}20`,
                        color: getStatusColor(selectedStudent.isActive)
                      }}
                    >
                      {getStatusText(selectedStudent.isActive)}
                    </span>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Last Login</label>
                  <p>
                    {selectedStudent.lastLogin
                      ? new Date(selectedStudent.lastLogin).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Joined</label>
                  <p>{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={() => handleStatusChange(selectedStudent._id, selectedStudent.isActive)}
              >
                {selectedStudent.isActive ? 'Deactivate Student' : 'Activate Student'}
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
