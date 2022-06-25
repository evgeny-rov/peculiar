export type DeferredRequest = {
  promise: Promise<any>;
  resolve: (data: any) => void;
  reject: (reason: any) => void;
};

const defer = (): DeferredRequest => {
  const deferred = {} as DeferredRequest;

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

export default defer;
