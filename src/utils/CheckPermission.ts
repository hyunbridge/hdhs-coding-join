import { Firebase } from '../utils';

const checkPermission = async () => {
    const form = Firebase.firestore().collection("permissions").doc('form');
    try {
        var doc = await form.get();
        if (doc.exists && doc.data()?.access === true) {
            return true;
        }
    } catch (_) {
        // Pass
    }
    return false;
}

export default checkPermission;
