import { proxy } from 'valtio';

const state = proxy({ number: 0 });

export default state;
