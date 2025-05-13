<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_GARCOM = 'garcom';
    const ROLE_COZINHEIRO = 'cozinheiro';
    const ROLE_GERENTE = 'gerente';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function isGarcom()
    {
        return $this->role === self::ROLE_GARCOM;
    }

    public function isCozinheiro()
    {
        return $this->role === self::ROLE_COZINHEIRO;
    }

    public function isGerente()
    {
        return $this->role === self::ROLE_GERENTE;
    }
}
