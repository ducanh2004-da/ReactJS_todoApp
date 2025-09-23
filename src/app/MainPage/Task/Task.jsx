import { gql } from '@apollo/client';
import { useState, useEffect } from 'react';
import { client } from '../../../configs/client.config';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TaskForm from './TaskForm';
import { AuthVar } from '../../Auth/AuthVar';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../../stores/useAuthStore';

export default function Task() {
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [rows, setRows] = useState([]);
        // const [tags, setTags] = useState([])
        const [editId, setEditId] = useState(null);
        const [formOpen, setFormOpen] = useState(false);
        const [totalTag, setTotalTag] = useState([]);
        const paginationModel = { page: 0, pageSize: 5 };
        const [auth, setAuth] = useState(AuthVar.get());
        const {user: authUser} = useAuthStore();

        const GET_TASKS = gql`
                query GetTasks($currentPage: Float!, $userId: Float!) {
                        tasks(currentPage: $currentPage, userId: $userId) {
                                totalTask
                                totalPage
                                items {
                                        id
                                        title
                                        description
                                        dueAt
                                        status
                                        tags {
                                                id
                                                title
                                                description
                                        }
                                }
                        }
                }
        `;
        const GET_TAGS = gql`
                  query {
                      tags {
                          id
                          title
                          description
                          taskId
                      }
                  }
              `;
        const DELETE_TASKS = gql`
        mutation DeleteTask($id: Float!) {
  deleteTask(id: $id) { 
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
        `
        const SEARCH_TASKS = gql`
        mutation SearchTask($title: String!, $userId: Float!) {
  search(title: $title, userId: $userId) {
    totalTask
    totalPage
    items {
      id
    title
    description
    dueAt
    status
    }
  }
}
  `;
        function refreshData() {
                client
                        .query({
                                query: GET_TASKS,
                                variables: {
                                        currentPage: Number(paginationModel.page) + 1,
                                        userId: Number(authUser.id)
                                }
                        })
                        .then(({ data }) => {
                                setRows(data.tasks.items);
                                setLoading(false);
                        })
                        .catch((err) => {
                                setError(err);
                                setLoading(false);
                        });

                client
                                .query({ query: GET_TAGS })
                                .then(({ data }) => {
                                    setTotalTag(data.tags)
                                    setLoading(false);
                                })
                                .catch((error) => {
                                    setError(error);
                                    setLoading(false);
                                });
        }
        useEffect(refreshData, []);

        const handleEdit = (id) => {
                setEditId(id);
                setFormOpen(true);
        };

        const handleDelete = async (id) => {
                try {
                        const res = await client.mutate({
                                mutation: DELETE_TASKS,
                                variables: { id: Number(id) }
                        });
                        const deleted = res.data.deleteTask;
                        if (deleted.data && deleted.data.id) {
                                toast.success(res.data.message);
                                refreshData();
                        }
                        else{
                                toast.error(res.data.message);
                        }
                } catch (err) {
                        setError(err);
                }
        };
        const handleSearch = async (event) => {
                event.preventDefault();
                setLoading(true);
                setError(null);
                try {
                        const res = await client.mutate({
                                mutation: SEARCH_TASKS,
                                variables: {
                                        title: event.target.search.value,
                                        userId: Number(authUser.id)
                                },
                        });
                        setRows(res.data.search.items);
                        setLoading(false);
                } catch (err) {
                        setError(err);
                }
        }

        const columns = [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'title', headerName: 'Title', width: 250 },
                { field: 'description', headerName: 'Description', width: 450 },
                {
                        field: 'tags',
                        headerName: 'Tags',
                        width: 150,
                        renderCell: (params) => {
                                const tags = params.row.tags || [];
                                return (
                                        <div className="flex flex-wrap gap-1">
                                                {tags.length > 0
                                                        ? tags.map(tag => (
                                                                <span key={tag.id} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium mr-1">
                                                                        {tag.title}
                                                                </span>
                                                        ))
                                                        : <span className="text-gray-400">No tags</span>
                                                }
                                        </div>
                                );
                        },
                },
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
                                                onClick={() => handleEdit(params.row.id)}
                                        >
                                                Edit
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
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <div className="search">
                                <form className="search mb-4 flex gap-2" onSubmit={handleSearch}>
                                        <input
                                                className='border border-gray-300 rounded-lg px-4 py-2 flex-grow'
                                                type="text"
                                                name='search'
                                                id='search'
                                                placeholder="Search tasks..." />
                                        <button className='btn'>Search</button>
                                </form>
                        </div>
                        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Tasks</h2>
                        {loading && <p className="text-gray-500">Loading...</p>}
                        {error && <p className="text-red-500">Error : {error.message}</p>}
                        <div className="mb-6">
                                <TaskForm
                                        className="mt-5"
                                        editId={editId}
                                        open={formOpen}
                                        totalTag = {totalTag}
                                        onClose={() => {
                                                setFormOpen(false);
                                                setEditId(null);
                                        }}
                                        rows={rows}
                                        onTaskChange={(task, editId) => {
                                                if (editId) {
                                                        // Edit mode: update the task in the list
                                                        setRows(prevRows => prevRows.map(row => row.id === task.id ? task : row));
                                                } else {
                                                        // Add mode: add the new task to the top
                                                        setRows(prevRows => [task, ...prevRows]);
                                                }
                                        }}
                                />
                        </div>
                        <Toaster position="top-right" />
                        <b className="block text-left text-lg text-indigo-600 mb-2">List of Tasks:</b>
                        <Paper sx={{ height: 400, width: '100%', borderRadius: '1rem', boxShadow: 3 }}>
                                <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        initialState={{ pagination: { paginationModel } }}
                                        pageSizeOptions={[5, 10]}
                                        checkboxSelection
                                        sx={{ border: 0, fontSize: 16, backgroundColor: 'white', borderRadius: '1rem' }}
                                />
                        </Paper>
                </div>
        );
}