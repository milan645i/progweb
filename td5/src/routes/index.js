import { Router } from 'express';
import { getAllContacts, getContactById, updateContact, removeContact, addContact} from '../controllers/contactController.js';
import { registerUser, loginUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const router = Router();

router.get('/', function (req, res) {
    res.status(200).json({
        status: 'API is Working',
        message: 'Welcome!',
    });
});

/**
 * @openapi
 * /contacts:
 *   get:
 *     description: All contacts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns all the contacts
 *   post:
 *     description: Add a new contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       '201':
 *         description: Contact created successfully
 *       '400':
 *         description: Bad request
 */
router.use('/contacts', requireAuth);
router.route('/contacts')
    .get(async (req, res) => {
        let response = await getAllContacts();
        if (response.success == true) {
            res.status(200).json(response);
        } else {
            res.status(404).json(response);
        }
    })
    .post(async (req, res) => {
        let response = await addContact(req.body);
        if (response.success == true) {
            res.status(201).json(response);
        } else {
            res.status(400).json(response);
        }
    });

/**
 * @openapi
 * /contacts/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The contact ID
 *   get:
 *     description: Get a contact by ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns the contact with the specified ID
 *       '404':
 *         description: Contact not found
 *   put:
 *     description: Update a contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Contact updated successfully
 *       '404':
 *         description: Contact not found
 *   delete:
 *     description: Remove a contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Contact removed successfully
 *       '404':
 *         description: Contact not found
 */
router.route('/contacts/:id')
    .get(async (req, res) => {
        let response = await getContactById(req.params.id);
        if (response.success == true) {
            res.status(200).json(response);
        } else {
            res.status(404).json(response);
        }
    })
    .put(async (req, res) => {
        let response = await updateContact(req.params.id, req.body.name, req.body.age);
        if (response.success == true) {
            res.status(200).json(response);
        } else {
            res.status(404).json(response);
        }
    })
    .delete(async (req, res) => {
        let response = await removeContact(req.params.id);
        if (response.success == true) {
            res.status(200).json(response);
        } else {
            res.status(404).json(response);
        }
    });

/**
 * @openapi
 * /auth/register:
 *   post:
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Bad request or user already exists
 */

router.route('/auth/register')
    .post(async (req, res) => {
        const { email, password } = req.body;
        let response = await registerUser(email, password);
        if (response.success == true) {
            res.status(201).json(response);
        } else {
            res.status(400).json(response);
        }
    });

/**
 * @openapi
 * /auth/login:
 *   post:
 *     description: Login and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful, returns token
 *       '401':
 *         description: Invalid credentials
 */
router.route('/auth/login')
    .post(async (req, res) => {
        const { email, password } = req.body;
        let response = await loginUser(email, password);
        if (response.success == true) {
            res.status(200).json(response);
        } else {
            res.status(401).json(response);
        }
    });

export default router;
    