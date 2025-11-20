<script setup>
import { ref, onMounted } from "vue";
import UserServices from "../services/userServices";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const users = ref([]);
const search = ref("");
const newUser = ref({
  fName: "",
  lName: "",
  email: "",
  role: "",
});
const selectedUser = ref(null);
const message = ref("");
const showAddDialog = ref(false);
const showEditDialog = ref(false);

// Role options
const roles = [
  { title: "Admin", value: "admin" },
  { title: "Coach", value: "coach" },
  { title: "Athlete", value: "athlete" },
];

// Table headers - Vuetify 3 format
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'First Name', key: 'fName' },
  { title: 'Last Name', key: 'lName' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Load all users
const fetchUsers = async () => {
  try {
    const response = await UserServices.getAllUsers();
    users.value = response.data;
    message.value = "";  
  } catch (error) {
    message.value = "Error loading users: " + error.message;
    console.error("Error fetching users:", error);
  }
};

// Create user
const saveUser = async () => {
  try {
    await UserServices.createUser(newUser.value);
    message.value = "User created successfully";
    newUser.value = { fName: "", lName: "", email: "", role: "" };
    showAddDialog.value = false;
    fetchUsers();
  } catch (error) {
    message.value = "Error creating user: " + (error.response?.data?.message || error.message);
  }
};

// Select user to edit
const editUser = (item) => {
  const user = item.raw || item;
  selectedUser.value = { ...user };
  showEditDialog.value = true;
};

// Update user
const updateUser = async () => {
  try {
    await UserServices.updateUser(selectedUser.value.id, selectedUser.value);
    message.value = "User updated successfully";
    showEditDialog.value = false;
    selectedUser.value = null;
    fetchUsers();
  } catch (error) {
    message.value = "Error updating user: " + (error.response?.data?.message || error.message);
  }
};

// Delete user
const deleteUser = async (item) => {
  const user = item.raw || item;
  const id = user.id;
  
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      await UserServices.deleteUser(id);
      message.value = "User deleted successfully";
      fetchUsers();
    } catch (error) {
      message.value = "Error deleting user: " + (error.response?.data?.message || error.message);
    }
  }
};

// Cancel actions
const cancelAdd = () => {
  newUser.value = { fName: "", lName: "", email: "", role: "" };
  showAddDialog.value = false;
  message.value = "";
};

const cancelEdit = () => {
  selectedUser.value = null;
  showEditDialog.value = false;
  message.value = "";
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <v-container>
    <v-card class="mx-auto" max-width="1200">
      <!-- Header -->
      <v-card-title class="text-h4 font-weight-bold pa-6">
        User Management
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          size="large"
          @click="showAddDialog = true"
          prepend-icon="mdi-plus"
        >
          Add User
        </v-btn>
      </v-card-title>
      
      <v-card-subtitle class="text-h6 pa-6 pt-0 text-grey">
        Manage system users and roles
      </v-card-subtitle>

      <!-- Message Display -->
      <v-alert
        v-if="message"
        :type="message.includes('Error') ? 'error' : 'success'"
        closable
        @click:close="message = ''"
        class="ma-6"
      >
        {{ message }}
      </v-alert>

      <!-- Users Table -->
      <v-card-text class="pa-6 pt-0">
        <v-data-table
          :headers="headers"
          :items="users"
          :search="search"
          class="elevation-1"
          :items-per-page="10"
        >
          <!-- Search -->
          <template v-slot:top>
            <v-text-field
              v-model="search"
              append-inner-icon="mdi-magnify"
              label="Search users"
              single-line
              hide-details
              class="mb-4"
            ></v-text-field>
          </template>

          <!-- Role Column -->
          <template v-slot:item.role="{ item }">
            <v-chip
              :color="
                (item.raw || item).role === 'admin' ? 'error' : 
                (item.raw || item).role === 'coach' ? 'primary' : 
                'success'
              "
              size="small"
            >
              {{ (item.raw || item).role }}
            </v-chip>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              class="mr-2"
              @click="editUser(item)"
              prepend-icon="mdi-pencil"
            >
              Edit
            </v-btn>
            <v-btn
              color="error"
              size="small"
              @click="deleteUser(item)"
              prepend-icon="mdi-delete"
            >
              Delete
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add User Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Add New User</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field
              v-model="newUser.fName"
              label="First Name *"
              :counter="50"
              required
            ></v-text-field>
            <v-text-field
              v-model="newUser.lName"
              label="Last Name *"
              :counter="50"
              required
            ></v-text-field>
            <v-text-field
              v-model="newUser.email"
              label="Email *"
              type="email"
              required
            ></v-text-field>
            <v-select
              v-model="newUser.role"
              :items="roles"
              item-title="title"
              item-value="value"
              label="Role *"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="cancelAdd">Cancel</v-btn>
          <v-btn
            color="success"
            :disabled="!valid"
            @click="saveUser"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit User Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card v-if="selectedUser">
        <v-card-title>
          <span class="text-h5">Edit User</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field
              v-model="selectedUser.fName"
              label="First Name *"
              :counter="50"
              required
            ></v-text-field>
            <v-text-field
              v-model="selectedUser.lName"
              label="Last Name *"
              :counter="50"
              required
            ></v-text-field>
            <v-text-field
              v-model="selectedUser.email"
              label="Email *"
              type="email"
              required
            ></v-text-field>
            <v-select
              v-model="selectedUser.role"
              :items="roles"
              item-title="title"
              item-value="value"
              label="Role *"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="cancelEdit">Cancel</v-btn>
          <v-btn
            color="success"
            :disabled="!valid"
            @click="updateUser"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* Add any custom styles here if needed */
</style>