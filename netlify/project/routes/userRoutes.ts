// Users Resource Router
// Ten plik demonstruje jak używać zagnieżdżonych routerów i resource routerów

import { NetlifyRouter, createResourceRouter } from '../../framework'
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/controllers'

// Sposób 1: Tradycyjny router (jak obecnie)
export const createUsersRouterTraditional = (): NetlifyRouter => {
  const router = new NetlifyRouter()
  
  router.get('/', getUsers)
  router.get('/:id', getUserById)
  router.post('/', createUser)
  router.put('/:id', updateUser)
  router.delete('/:id', deleteUser)
  
  return router
}

// Sposób 2: Resource router (bardziej zwięzły, podobny do Rails)
export const createUsersRouterResource = (): NetlifyRouter => {
  return createResourceRouter({
    index: getUsers,     // GET /users
    show: getUserById,   // GET /users/:id
    create: createUser,  // POST /users
    update: updateUser,  // PUT /users/:id
    destroy: deleteUser  // DELETE /users/:id
  })
}

// Sposób 3: Kombinacja z dodatkowymi routami
export const createUsersRouterExtended = (): NetlifyRouter => {
  const router = createResourceRouter({
    index: getUsers,
    show: getUserById,
    create: createUser,
    update: updateUser,
    destroy: deleteUser
  })
  
  // Dodaj dodatkowe custom routes
  // router.get('/search', searchUsers)
  // router.post('/:id/avatar', uploadUserAvatar)
  
  return router
}
