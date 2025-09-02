import { combineReducers } from 'redux'

import canvasObjectsReducer from '@/features/canvasObjects/canvasObjectsSlice'

const rootReducer = combineReducers({
  // Define a top-level state field named `todos`, handled by `todosReducer`
  canvasObjects: canvasObjectsReducer,
})

export default rootReducer
