import React, { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { client } from "../../configs/client.config";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // nếu muốn điều khiển phân trang later, chuyển sang useState
  const paginationModel = { page: 0, pageSize: 5 };

  const GET_USERS = gql`
    query Users($currentPage: Float!) {
      users(currentPage: $currentPage) {
        items {
          email
          firstName
          id
          lastName
          role
        }
        totalPage
        totalTask
      }
    }
  `;

  const DELETE_USER = gql`
    mutation DeleteUser($userId: Float!) {
      deleteUser(userId: $userId) {
        message
        data {
          id
          title
          description
          dueAt
          status
        }
      }
    }
  `;

  async function refreshData() {
    setLoading(true);
    setError(null);
    try {
      // await và destructure { data }
      const result = await client.query({
        query: GET_USERS,
        variables: { currentPage: Number(paginationModel.page) + 1 },
        fetchPolicy: "network-only" // để tránh cache khi debug
      });

      // Apollo trả về object { data: { users: ... } }
      const data = result?.data;
      // debug: in kết quả ra console nếu cần
      // console.log("GET_USERS result", result);

      if (!data?.users?.items) {
        setError("Users unavailable or empty");
        setRows([]);
        setLoading(false);
        return;
      }

      // đảm bảo mỗi row có field `id`
      const items = data.users.items.map(item => ({ ...item, id: item.id }));
      setRows(items);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // gọi wrapper để tránh cảnh báo effect callback không trả về promise
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await client.mutate({
        mutation: DELETE_USER,
        variables: { userId: Number(id) }
      });
      const deleted = res?.data?.deleteUser;
      if (deleted?.data && deleted.data.id) {
        toast.success(deleted.message || "Deleted");
        await refreshData();
      } else {
        const msg = deleted?.message || "Delete failed";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
      toast.error("Delete error");
    }
  }

  const handleDetail = (id) => {
    console.log("View detail id =", id);
    // mở modal hoặc navigate sang trang detail ở đây
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'firstName', headerName: 'First name', width: 200 },
    { field: 'lastName', headerName: 'Last name', width: 200 },
    { field: 'role', headerName: 'Role', type: 'string', width: 100 },
    { field: 'email', headerName: 'Email', sortable: false, width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div>
          <button
            style={{ marginRight: 8, padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            onClick={() => handleDetail(params.row.id)}
          >
            View Detail
          </button>
          <button
            style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Toaster />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
          loading={loading}
        />
      </Paper>
    </>
  );
}
