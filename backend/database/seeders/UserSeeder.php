<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@administrator.com'],
            [
                'fname' => 'Admin',
                'lname' => 'User',
                'password' => bcrypt('Nomameno$'),
                'role' => 'admin'
            ]
        );

        User::firstOrCreate(
            ['email' => 'janeauthor@example.com'],
            [
                'fname' => 'Jane',
                'lname' => 'Doe',
                'password' => bcrypt('stupid_passkey'),
                'role' => 'author'
            ]
        );

        User::firstOrCreate(
            ['email' => 'johnreader@example.com'],
            [
                'fname' => 'John',
                'lname' => 'Doe',
                'password' => bcrypt('stupid_password'),
                'role' => 'viewer'
            ]
        );

        $this->command->info('Users seeded successfully!');
    }
}
