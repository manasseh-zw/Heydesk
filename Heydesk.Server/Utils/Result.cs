namespace Heydesk.Server.Utils;

public class Result<T>
{
    public T? Data { get; init; }
    public bool Success { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = [];

    private Result(bool success, T? data = default, IReadOnlyList<string>? errors = null)
    {
        Success = success;
        Data = data;
        Errors = errors ?? [];
    }

    // Static factory methods
    public static Result<T> Ok(T data) => new(true, data);

    public static Result<T> Fail(string error) => new(false, default, [error]);

    public static Result<T> Fail(List<string> errors) => new(false, default, errors);

    public static Result<T> Fail(IReadOnlyList<string> errors) => new(false, default, errors);

    public static Result<T> Exception(string errorMessage) => new(false, default, [errorMessage]);

    // Implicit conversions
    public static implicit operator Result<T>(T value) => Ok(value);

    public static implicit operator Result<T>(SuccessResult<T> successResult) =>
        Ok(successResult.Data);

    public static implicit operator Result<T>(FailureResult failureResult) =>
        Fail(failureResult.Errors);
}

// Non-generic Result class for static factory methods
public struct Result
{
    public static SuccessResult<T> Ok<T>(T data) => new(data);

    public static FailureResult Fail(string message) => new(message);

    public static FailureResult Fail(List<string> errors) => new(errors);

    public static FailureResult Fail(IReadOnlyList<string> errors) => new(errors);

    public static FailureResult Exception(string message) => new(message);
}

public class SuccessResult<T>
{
    public T Data { get; }

    internal SuccessResult(T data)
    {
        Data = data;
    }
}

public class FailureResult
{
    public IReadOnlyList<string> Errors { get; }

    internal FailureResult(string message)
    {
        Errors = [message];
    }

    internal FailureResult(List<string> errors)
    {
        Errors = errors;
    }

    internal FailureResult(IReadOnlyList<string> errors)
    {
        Errors = errors;
    }
}
