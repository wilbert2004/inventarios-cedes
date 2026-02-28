// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  users: {
    getAll: () => ipcRenderer.invoke("users:getAll"),
    create: (user) => ipcRenderer.invoke("users:create", user),
    update: (id, user) => ipcRenderer.invoke("users:update", id, user),
    delete: (id) => ipcRenderer.invoke("users:delete", id),
    login: (credentials) => ipcRenderer.invoke("users:login", credentials),
    requestPasswordReset: (username) => ipcRenderer.invoke("users:requestPasswordReset", username),
    resetPassword: (resetData) => ipcRenderer.invoke("users:resetPassword", resetData),
    changePassword: (userId, currentPassword, newPassword) =>
      ipcRenderer.invoke("users:changePassword", userId, currentPassword, newPassword),
  },

  products: {
    getAll: () => ipcRenderer.invoke("products:getAll"),
    create: (product) => ipcRenderer.invoke("products:create", product),
    update: (id, product) => ipcRenderer.invoke("products:update", id, product),
    delete: (id) => ipcRenderer.invoke("products:delete", id),
  },

  sales: {
    create: (sale) => ipcRenderer.invoke("sales:create", sale),
    getAll: () => ipcRenderer.invoke("sales:getAll"),
    getById: (id) => ipcRenderer.invoke("sales:getById", id),
    reprintTicket: (id) => ipcRenderer.invoke("sales:reprintTicket", id),
  },

  inventory: {
    productEntry: (entry) => ipcRenderer.invoke("inventory:productEntry", entry),
    productExit: (exit) => ipcRenderer.invoke("inventory:productExit", exit),
    getMovements: (filters) => ipcRenderer.invoke("inventory:getMovements", filters),
  },

  printer: {
    printTicket: (saleData) => ipcRenderer.invoke("printer:printTicket", saleData),
    getPrinters: () => ipcRenderer.invoke("printer:getPrinters"),
    getConfig: () => ipcRenderer.invoke("printer:getConfig"),
    saveConfig: (config) => ipcRenderer.invoke("printer:saveConfig", config),
  },
  reports: {
    getSalesByDateRange: (startDate, endDate) =>
      ipcRenderer.invoke("reports:getSalesByDateRange", startDate, endDate),

    getSaleDetail: (saleId) =>
      ipcRenderer.invoke("reports:getSaleDetail", saleId),

    getDailyStats: (startDate, endDate) =>
      ipcRenderer.invoke("reports:getDailyStats", startDate, endDate),

    getTopProducts: (startDate, endDate, limit) =>
      ipcRenderer.invoke("reports:getTopProducts", startDate, endDate, limit),

    generatePDF: (reportData, reportType) =>
      ipcRenderer.invoke("reports:generatePDF", reportData, reportType),

    generateCustodyVoucher: (custodyId) =>
      ipcRenderer.invoke("reports:generateCustodyVoucher", custodyId),
  },

  settings: {
    getAll: () => ipcRenderer.invoke("settings:getAll"),
    get: (key) => ipcRenderer.invoke("settings:get", key),
    set: (key, value) => ipcRenderer.invoke("settings:set", key, value),
    setAll: (settings) => ipcRenderer.invoke("settings:setAll", settings),
    getCompany: () => ipcRenderer.invoke("settings:getCompany"),
  },

  backup: {
    create: (customPath) => ipcRenderer.invoke("backup:create", customPath),
    restore: (backupPath) => ipcRenderer.invoke("backup:restore", backupPath),
    list: () => ipcRenderer.invoke("backup:list"),
    delete: (backupPath) => ipcRenderer.invoke("backup:delete", backupPath),
    selectFile: () => ipcRenderer.invoke("backup:selectFile"),
    saveDialog: () => ipcRenderer.invoke("backup:saveDialog"),
    validateIntegrity: () => ipcRenderer.invoke("backup:validateIntegrity"),
    getDbInfo: () => ipcRenderer.invoke("backup:getDbInfo"),
  },

  window: {
    focus: () => ipcRenderer.invoke("window:focus"),
  },

  license: {
    getStatus: () => ipcRenderer.invoke("license:getStatus"),
    activate: (licenseKey) => ipcRenderer.invoke("license:activate", licenseKey),
    getHardwareId: () => ipcRenderer.invoke("license:getHardwareId"),
    generate: () => ipcRenderer.invoke("license:generate"),
  },

  custody: {
    checkFolioExists: (folio) => ipcRenderer.invoke("custody:checkFolioExists", folio),
    createCustodyEntry: (payload) => ipcRenderer.invoke("custody:createCustodyEntry", payload),
    getCustodyEntry: (entryId) => ipcRenderer.invoke("custody:getCustodyEntry", entryId),
    listCustodyEntries: (filters) => ipcRenderer.invoke("custody:listCustodyEntries", filters),
    updateStatus: (entryId, newStatus) => ipcRenderer.invoke("custody:updateStatus", entryId, newStatus),
    deleteCustodyEntry: (entryId) => ipcRenderer.invoke("custody:deleteCustodyEntry", entryId),
  },

  custodyExit: {
    process: (exitData) => ipcRenderer.invoke("custodyExit:process", exitData),
    getAll: () => ipcRenderer.invoke("custodyExit:getAll"),
    getById: (exitId) => ipcRenderer.invoke("custodyExit:getById", exitId),
    checkFolioExists: (folio) => ipcRenderer.invoke("custodyExit:checkFolioExists", folio),
    generateFolio: () => ipcRenderer.invoke("custodyExit:generateFolio"),
  },

  custodyProducts: {
    create: (product) => ipcRenderer.invoke("custodyProducts:create", product),
    getAll: () => ipcRenderer.invoke("custodyProducts:getAll"),
    update: (id, product) => ipcRenderer.invoke("custodyProducts:update", id, product),
    delete: (id) => ipcRenderer.invoke("custodyProducts:delete", id),
    changeStatus: (id, newStatus, reasonChange, changedBy, receptionData) => ipcRenderer.invoke("custodyProducts:changeStatus", id, newStatus, reasonChange, changedBy, receptionData),
    getHistory: (id) => ipcRenderer.invoke("custodyProducts:getHistory", id),
    search: (query) => ipcRenderer.invoke("custodyProducts:search", query),
    getByStatus: (status) => ipcRenderer.invoke("custodyProducts:getByStatus", status),
    getByReason: (reason) => ipcRenderer.invoke("custodyProducts:getByReason", reason),
    getStatistics: () => ipcRenderer.invoke("custodyProducts:getStatistics"),
    validateInventoryNumber: (number) => ipcRenderer.invoke("custodyProducts:validateInventoryNumber", number),
    validateSerialNumber: (number) => ipcRenderer.invoke("custodyProducts:validateSerialNumber", number),
  },

  // Módulo de Registro y Resguardo de Productos (Ciclo de Vida Completo)
  custodyLifecycle: {
    register: (productData) => ipcRenderer.invoke("custodyLifecycle:register", productData),
    update: (data) => ipcRenderer.invoke("custodyLifecycle:update", data),
    registerDriverReception: (data) => ipcRenderer.invoke("custodyLifecycle:registerDriverReception", data),
    registerWarehouseReception: (data) => ipcRenderer.invoke("custodyLifecycle:registerWarehouseReception", data),
    changeStatus: (data) => ipcRenderer.invoke("custodyLifecycle:changeStatus", data),
    deactivate: (data) => ipcRenderer.invoke("custodyLifecycle:deactivate", data),
    getAll: (filters) => ipcRenderer.invoke("custodyLifecycle:getAll", filters),
    getHistory: (productId) => ipcRenderer.invoke("custodyLifecycle:getHistory", productId),
    getStatistics: () => ipcRenderer.invoke("custodyLifecycle:getStatistics"),
  },

  shell: {
    openPath: (path) => ipcRenderer.invoke("shell:openPath", path),
  },
});