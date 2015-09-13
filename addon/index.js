import AutosaveProxy, { flushPendingSave, cancelPendingSave } from './autosave-proxy';
import computedAutosave from './computed-autosave';

export default computedAutosave;
export {
  AutosaveProxy,
  flushPendingSave,
  computedAutosave,
  cancelPendingSave
};
