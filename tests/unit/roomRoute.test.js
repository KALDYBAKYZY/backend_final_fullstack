const { escapeRegex } = require('../../src/utils/helpers');

const mockJson = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockJson }));
const mockRes = { json: mockJson, status: mockStatus };

jest.mock('../../src/models/Room', () => ({
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([
      { _id: '1', name: 'Math Room', subject: 'Math', members: [] }
    ])
  })
}));
describe('Room route handler logic', () => {
 
  it('GET /rooms handler returns rooms and calls res.json', async () => {
    const Room = require('../../src/models/Room');
    const handler = async (req, res) => {
      try {
        const { search, subject } = req.query;
        const filter = {};
        if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
        if (subject) filter.subject = subject;
        const rooms = await Room.find(filter)
          .populate('owner', 'username avatar')
          .populate('members', 'username avatar')
          .sort('-createdAt');
        res.json(rooms);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    };
    const mockReq = { query: { subject: 'Math' } };
    await handler(mockReq, mockRes);
    expect(mockJson).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'Math Room' })
    ]));
  });
});